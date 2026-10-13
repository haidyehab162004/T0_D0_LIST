import type { CookieOptions, Response } from "express";

import { env } from "../../config/env";
import { asyncHandler } from "../../middleware/async-handler";
import {
  AUTH_TOKEN_EXPIRES_IN_SECONDS,
} from "../../utils/auth-token";
import { authService } from "./auth.service";
import type {
  EmailInput,
  GoogleLoginInput,
  LoginInput,
  OtpInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.types";

function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_TOKEN_EXPIRES_IN_SECONDS * 1000,
  };
}

function setAuthCookie(response: Response, token: string): void {
  response.cookie(
    env.authCookieName,
    token,
    authCookieOptions(),
  );
}

function clearAuthCookie(response: Response): void {
  const {
    maxAge: _maxAge,
    ...options
  } = authCookieOptions();

  response.clearCookie(
    env.authCookieName,
    options,
  );
}

export const register = asyncHandler(async (request, response) => {
  const result = await authService.register(
    request.body as RegisterInput,
  );

  response.status(201).json(result);
});

export const verifyEmail = asyncHandler(async (request, response) => {
  const result = await authService.verifyEmail(
    request.body as OtpInput,
  );

  setAuthCookie(response, result.token);

  response.status(200).json({
    message: result.message,
    user: result.user,
  });
});

export const resendVerificationOtp = asyncHandler(
  async (request, response) => {
    const message = await authService.resendVerificationOtp(
      request.body as EmailInput,
    );

    response.status(200).json({ message });
  },
);

export const login = asyncHandler(async (request, response) => {
  const result = await authService.login(
    request.body as LoginInput,
  );

  setAuthCookie(response, result.token);

  response.status(200).json({
    user: result.user,
  });
});

export const googleLogin = asyncHandler(async (request, response) => {
  const result = await authService.googleLogin(
    request.body as GoogleLoginInput,
  );

  setAuthCookie(response, result.token);

  response.status(200).json({
    user: result.user,
  });
});

export const forgotPassword = asyncHandler(
  async (request, response) => {
    const message = await authService.forgotPassword(
      request.body as EmailInput,
    );

    response.status(200).json({ message });
  },
);

export const verifyResetOtp = asyncHandler(
  async (request, response) => {
    const result = await authService.verifyResetOtp(
      request.body as OtpInput,
    );

    response.status(200).json(result);
  },
);

export const resetPassword = asyncHandler(
  async (request, response) => {
    const message = await authService.resetPassword(
      request.body as ResetPasswordInput,
    );

    response.status(200).json({ message });
  },
);

export const getCurrentUser = asyncHandler(
  async (request, response) => {
    const user = await authService.getCurrentUser(
      request.auth!.userId,
    );

    response.status(200).json({ user });
  },
);

export const logout = asyncHandler(async (_request, response) => {
  clearAuthCookie(response);
  response.status(204).send();
});
