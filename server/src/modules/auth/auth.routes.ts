import { Router } from "express";

import { requireAuth } from "../../middleware/require-auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import {
  forgotPassword,
  getCurrentUser,
  googleLogin,
  login,
  logout,
  register,
  resendVerificationOtp,
  resetPassword,
  verifyEmail,
  verifyResetOtp,
} from "./auth.controller";
import {
  forgotPasswordValidation,
  googleLoginValidation,
  loginValidation,
  registerValidation,
  resendVerificationOtpValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  verifyResetOtpValidation,
} from "./auth.validation";

export const authRouter = Router(); 

authRouter.post("/register", validateRequest(registerValidation), register);
authRouter.post("/verify-email", validateRequest(verifyEmailValidation), verifyEmail);
authRouter.post(
  "/resend-verification-otp",
  validateRequest(resendVerificationOtpValidation),
  resendVerificationOtp,
);
authRouter.post("/login", validateRequest(loginValidation), login);
authRouter.post("/google", validateRequest(googleLoginValidation), googleLogin);
authRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordValidation),
  forgotPassword,
);
authRouter.post(
  "/verify-reset-otp",
  validateRequest(verifyResetOtpValidation),
  verifyResetOtp,
);
authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordValidation),
  resetPassword,
);

authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.post("/logout", requireAuth, logout);
