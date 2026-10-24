import bcrypt from "bcryptjs";

import {
  sendPasswordResetOtp,
  sendVerificationOtp,
} from "../../integrations/email/email.service";
import { verifyGoogleCredential } from "../../integrations/google/google-auth.service";
import { redisClient } from "../../integrations/redis/redis";
import { AppError } from "../../utils/app-error";
import { createAuthToken } from "../../utils/auth-token";
import {
  generateOtp,
  generateResetToken,
  hashSensitiveValue,
  matchesSensitiveHash,
} from "../../utils/otp";
import { authRepository } from "./auth.repository";
import type {
  AuthenticatedResult,
  EmailInput,
  GoogleLoginInput,
  LoginInput,
  OtpInput,
  PublicUser,
  RegisterInput,
  RegisterResult,
  ResetPasswordInput,
  ResetTokenResult,
  VerificationResult,
} from "./auth.types";

const OTP_TTL_SECONDS = 10 * 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_ATTEMPT_TTL_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const FORGOT_PASSWORD_COOLDOWN_SECONDS = 60;
const RESET_TOKEN_TTL_SECONDS = 10 * 60;
const REGISTER_RATE_WINDOW_SECONDS = 15 * 60;
const REGISTER_RATE_MAX = 5;
const LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60;
const LOGIN_FAILURE_MAX = 5;
const PASSWORD_HASH_ROUNDS = 12;

type OtpPurpose = "verify-email" | "reset-password";

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

function emailKeyPart(email: string): string {
  return hashSensitiveValue(`email:${normalizedEmail(email)}`);
}

function otpKey(purpose: OtpPurpose, userId: number): string {
  return `auth:otp:${purpose}:${userId}`;
}

function otpAttemptsKey(purpose: OtpPurpose, userId: number): string {
  return `auth:otp-attempts:${purpose}:${userId}`;
}

function registerRateKey(email: string): string {
  return `auth:rate:register:${emailKeyPart(email)}`;
}

function loginFailureKey(email: string): string {
  return `auth:rate:login:${emailKeyPart(email)}`;
}

function resendCooldownKey(email: string): string {
  return `auth:cooldown:verify-email:${emailKeyPart(email)}`;
}

function forgotPasswordCooldownKey(email: string): string {
  return `auth:cooldown:forgot-password:${emailKeyPart(email)}`;
}

function resetTokenKey(token: string): string {
  return `auth:reset-token:${hashSensitiveValue(token)}`;
}

async function incrementCounter(
  key: string,
  ttlSeconds: number,
): Promise<number> {
  const count = await redisClient.incr(key);

  // Refreshing the TTL makes the window expire after the last failed/requested
  // attempt instead of leaving a counter around forever.
  await redisClient.expire(key, ttlSeconds);

  return count;
}

async function consumeRequestLimit(
  key: string,
  maxRequests: number,
  ttlSeconds: number,
  message: string,
): Promise<void> {
  const count = await incrementCounter(key, ttlSeconds);

  if (count > maxRequests) {
    throw new AppError(
      429,
      "RATE_LIMITED",
      message,
    );
  }
}

async function consumeCooldown(
  key: string,
  ttlSeconds: number,
  message: string,
): Promise<void> {
  const result = await redisClient.set(key, "1", {
    EX: ttlSeconds,
    NX: true,
  });

  if (result === null) {
    throw new AppError(
      429,
      "RATE_LIMITED",
      message,
    );
  }
}

async function storeOtp(
  purpose: OtpPurpose,
  userId: number,
  otp: string,
): Promise<void> {
  await redisClient.set(
    otpKey(purpose, userId),
    hashSensitiveValue(otp),
    {
      EX: OTP_TTL_SECONDS,
    },
  );

  await redisClient.del(otpAttemptsKey(purpose, userId));
}

async function clearOtp(
  purpose: OtpPurpose,
  userId: number,
): Promise<void> {
  await Promise.all([
    redisClient.del(otpKey(purpose, userId)),
    redisClient.del(otpAttemptsKey(purpose, userId)),
  ]);
}

async function verifyStoredOtp(
  purpose: OtpPurpose,
  userId: number,
  otp: string,
): Promise<void> {
  const attemptsKey = otpAttemptsKey(purpose, userId);
  const currentAttempts = Number((await redisClient.get(attemptsKey)) ?? "0");

  if (currentAttempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(
      429,
      "OTP_ATTEMPTS_EXCEEDED",
      "Too many verification attempts. Request a new code.",
    );
  }

  const storedHash = await redisClient.get(otpKey(purpose, userId));

  if (!storedHash || !matchesSensitiveHash(otp, storedHash)) {
    const attempts = await incrementCounter(
      attemptsKey,
      OTP_ATTEMPT_TTL_SECONDS,
    );

    if (attempts >= OTP_MAX_ATTEMPTS) {
      await redisClient.del(otpKey(purpose, userId));

      throw new AppError(
        429,
        "OTP_ATTEMPTS_EXCEEDED",
        "Too many verification attempts. Request a new code.",
      );
    }

    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_OTP",
      "The verification code is invalid or has expired.",
    );
  }

  await clearOtp(purpose, userId);
}

function authResult(user: PublicUser): AuthenticatedResult {
  return {
    user,
    token: createAuthToken(user.id),
  };
}

function isPostgresUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function register(input: RegisterInput): Promise<RegisterResult> {
  const email = normalizedEmail(input.email);

  await consumeRequestLimit(
    registerRateKey(email),
    REGISTER_RATE_MAX,
    REGISTER_RATE_WINDOW_SECONDS,
    "Too many requests. Please try again later.",
  );

  const existing = await authRepository.findUserByEmail(email);

  if (existing) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "An account with this email already exists.",
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    PASSWORD_HASH_ROUNDS,
  );

  let user: PublicUser;

  try {
    user = await authRepository.createLocalUser(
      {
        ...input,
        email,
      },
      passwordHash,
    );
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_EXISTS",
        "An account with this email already exists.",
      );
    }

    throw error;
  }

  const otp = generateOtp();

  await storeOtp("verify-email", user.id, otp);

  try {
    await sendVerificationOtp(user.email, otp);
  } catch (error) {
    await clearOtp("verify-email", user.id);
    throw error;
  }

  return {
    message: "Verification code sent to your email.",
    user,
  };
}

async function verifyEmail(input: OtpInput): Promise<VerificationResult> {
  const account = await authRepository.findLocalAccountByEmail(
    normalizedEmail(input.email),
  );

  if (!account || account.emailVerified) {
    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_OTP",
      "The verification code is invalid or has expired.",
    );
  }

  await verifyStoredOtp(
    "verify-email",
    account.id,
    input.otp,
  );

  const user = await authRepository.markEmailVerified(account.id);

  if (!user) {
    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_OTP",
      "The verification code is invalid or has expired.",
    );
  }

  return {
    message: "Email verified successfully.",
    ...authResult(user),
  };
}

async function resendVerificationOtp(input: EmailInput): Promise<string> {
  const email = normalizedEmail(input.email);

  await consumeCooldown(
    resendCooldownKey(email),
    RESEND_COOLDOWN_SECONDS,
    "Please wait before requesting another code.",
  );

  const account = await authRepository.findLocalAccountByEmail(email);

  if (!account || account.emailVerified) {
    return "If the account requires verification, a new code has been sent.";
  }

  const otp = generateOtp();

  await storeOtp("verify-email", account.id, otp);

  try {
    await sendVerificationOtp(account.email, otp);
  } catch (error) {
    await clearOtp("verify-email", account.id);
    console.error("Failed to send verification OTP", error);
  }

  return "If the account requires verification, a new code has been sent.";
}

async function login(input: LoginInput): Promise<AuthenticatedResult> {
  const email = normalizedEmail(input.email);
  const failureKey = loginFailureKey(email);
  const existingFailures = Number(
    (await redisClient.get(failureKey)) ?? "0",
  );

  if (existingFailures >= LOGIN_FAILURE_MAX) {
    throw new AppError(
      429,
      "RATE_LIMITED",
      "Too many login attempts. Please try again later.",
    );
  }

  const account = await authRepository.findLocalAccountByEmail(email);

  const passwordMatches =
    Boolean(account?.passwordHash) &&
    (await bcrypt.compare(
      input.password,
      account!.passwordHash!,
    ));

  if (!account || !passwordMatches) {
    const failures = await incrementCounter(
      failureKey,
      LOGIN_FAILURE_WINDOW_SECONDS,
    );

    if (failures >= LOGIN_FAILURE_MAX) {
      throw new AppError(
        429,
        "RATE_LIMITED",
        "Too many login attempts. Please try again later.",
      );
    }

    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password.",
    );
  }

  await redisClient.del(failureKey);

  if (!account.emailVerified) {
    throw new AppError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Please verify your email before signing in.",
    );
  }

  return authResult(account);
}

async function googleLogin(
  input: GoogleLoginInput,
): Promise<AuthenticatedResult> {
  const profile = await verifyGoogleCredential(input.credential);

  let existingGoogle =
    await authRepository.findGoogleAccountByProviderId(
      profile.providerAccountId,
    );

  if (existingGoogle) {
    if (!existingGoogle.emailVerified) {
      const verified = await authRepository.markEmailVerified(
        existingGoogle.id,
      );

      if (verified) {
        existingGoogle = verified;
      }
    }

    return authResult(existingGoogle);
  }

  const existingEmail = await authRepository.findUserByEmail(
    profile.email,
  );

  if (existingEmail) {
    throw new AppError(
      409,
      "ACCOUNT_LINKING_REQUIRED",
      "An account already exists for this email. Sign in using the existing method before linking Google.",
    );
  }

  try {
    const user = await authRepository.createGoogleUser(profile);
    return authResult(user);
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      existingGoogle =
        await authRepository.findGoogleAccountByProviderId(
          profile.providerAccountId,
        );

      if (existingGoogle) {
        return authResult(existingGoogle);
      }

      throw new AppError(
        409,
        "ACCOUNT_LINKING_REQUIRED",
        "An account already exists for this email. Sign in using the existing method before linking Google.",
      );
    }

    throw error;
  }
}

async function linkGoogleAccount(
  userId: number,
  input: GoogleLoginInput,
): Promise<{ message: string; user: PublicUser }> {
  const profile = await verifyGoogleCredential(input.credential);
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required.");
  }

  if (normalizedEmail(user.email) !== normalizedEmail(profile.email)) {
    throw new AppError(
      403,
      "GOOGLE_EMAIL_MISMATCH",
      "Sign in with a Google account that uses the same email address.",
    );
  }

  const linkedUser = await authRepository.findGoogleAccountByProviderId(
    profile.providerAccountId,
  );

  if (linkedUser) {
    if (linkedUser.id === user.id) {
      return { message: "Google account is already linked.", user };
    }

    throw new AppError(
      409,
      "GOOGLE_ACCOUNT_IN_USE",
      "This Google account is linked to another account.",
    );
  }

  try {
    await authRepository.createGoogleAccountLink(
      user.id,
      profile.providerAccountId,
    );
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      throw new AppError(
        409,
        "GOOGLE_ACCOUNT_IN_USE",
        "A Google account is already linked to this account or another account.",
      );
    }

    throw error;
  }

  return { message: "Google account linked successfully.", user };
}

async function forgotPassword(input: EmailInput): Promise<string> {
  const email = normalizedEmail(input.email);

  await consumeCooldown(
    forgotPasswordCooldownKey(email),
    FORGOT_PASSWORD_COOLDOWN_SECONDS,
    "Too many requests. Please try again later.",
  );

  const account = await authRepository.findLocalAccountByEmail(email);

  if (!account) {
    return "If an account exists for this email, a verification code has been sent.";
  }

  const otp = generateOtp();

  await storeOtp("reset-password", account.id, otp);

  try {
    await sendPasswordResetOtp(account.email, otp);
  } catch (error) {
    await clearOtp("reset-password", account.id);
    console.error("Failed to send password-reset OTP", error);
  }

  return "If an account exists for this email, a verification code has been sent.";
}

async function verifyResetOtp(
  input: OtpInput,
): Promise<ResetTokenResult> {
  const account = await authRepository.findLocalAccountByEmail(
    normalizedEmail(input.email),
  );

  if (!account) {
    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_OTP",
      "The verification code is invalid or has expired.",
    );
  }

  await verifyStoredOtp(
    "reset-password",
    account.id,
    input.otp,
  );

  const resetToken = generateResetToken();

  await redisClient.set(
    resetTokenKey(resetToken),
    String(account.id),
    {
      EX: RESET_TOKEN_TTL_SECONDS,
    },
  );

  return {
    resetToken,
    expiresInSeconds: RESET_TOKEN_TTL_SECONDS,
  };
}

async function resetPassword(
  input: ResetPasswordInput,
): Promise<string> {
  const key = resetTokenKey(input.resetToken);
  const userIdValue = await redisClient.sendCommand([
    "GETDEL",
    key,
  ]);

  if (typeof userIdValue !== "string") {
    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_RESET_TOKEN",
      "The reset token is invalid or has expired.",
    );
  }

  const userId = Number(userIdValue);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_RESET_TOKEN",
      "The reset token is invalid or has expired.",
    );
  }

  const passwordHash = await bcrypt.hash(
    input.newPassword,
    PASSWORD_HASH_ROUNDS,
  );

  const updated = await authRepository.updateLocalPassword(
    userId,
    passwordHash,
  );

  if (!updated) {
    throw new AppError(
      400,
      "INVALID_OR_EXPIRED_RESET_TOKEN",
      "The reset token is invalid or has expired.",
    );
  }

  const user = await authRepository.findUserById(userId);

  if (user) {
    await redisClient.del(loginFailureKey(user.email));
  }

  return "Password reset successfully.";
}

async function getCurrentUser(userId: number): Promise<PublicUser> {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError(
      401,
      "UNAUTHENTICATED",
      "Authentication required.",
    );
  }

  return user;
}

export const authService = {
  register,
  verifyEmail,
  resendVerificationOtp,
  login,
  googleLogin,
  linkGoogleAccount,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getCurrentUser,
};
