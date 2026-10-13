import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Email must be valid.")
  .transform((email) => email.toLowerCase());

const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Verification code must be exactly 6 digits.");

function passwordFitsBcryptLimit(password: string): boolean {
  return Buffer.byteLength(password, "utf8") <= 72;
}

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .refine(
    passwordFitsBcryptLimit,
    "Password must not exceed 72 bytes.",
  );

const loginPasswordSchema = z
  .string()
  .min(1, "Password is required.")
  .refine(
    passwordFitsBcryptLimit,
    "Password must not exceed 72 bytes.",
  );

export const registerValidation = {
  body: z.object({
    name: z.string().trim().min(1, "Name is required."),
    email: emailSchema,
    password: passwordSchema,
  }),
};

export const verifyEmailValidation = {
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
  }),
};

export const resendVerificationOtpValidation = {
  body: z.object({
    email: emailSchema,
  }),
};

export const loginValidation = {
  body: z.object({
    email: emailSchema,
    password: loginPasswordSchema,
  }),
};

export const googleLoginValidation = {
  body: z.object({
    credential: z.string().trim().min(1, "Google credential is required."),
  }),
};

export const forgotPasswordValidation = {
  body: z.object({
    email: emailSchema,
  }),
};

export const verifyResetOtpValidation = {
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
  }),
};

export const resetPasswordValidation = {
  body: z.object({
    resetToken: z.string().trim().min(1, "Reset token is required."),
    newPassword: passwordSchema,
  }),
};
