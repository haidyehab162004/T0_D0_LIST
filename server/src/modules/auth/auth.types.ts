export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface EmailInput {
  email: string;
}

export interface OtpInput {
  email: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleLoginInput {
  credential: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface LocalAuthRecord extends PublicUser {
  passwordHash: string | null;
}

export interface AuthenticatedResult {
  user: PublicUser;
  token: string;
}

export interface RegisterResult {
  message: string;
  user: PublicUser;
}

export interface VerificationResult extends AuthenticatedResult {
  message: string;
}

export interface ResetTokenResult {
  resetToken: string;
  expiresInSeconds: number;
}
