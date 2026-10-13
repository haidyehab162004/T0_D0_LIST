import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "./app-error";

export const AUTH_TOKEN_EXPIRES_IN_SECONDS = 24 * 60 * 60;

export function createAuthToken(userId: number): string {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Cannot create an auth token without a valid user ID.");
  }

  return jwt.sign({}, env.jwtSecret, {
    algorithm: "HS256",
    subject: String(userId),
    expiresIn: AUTH_TOKEN_EXPIRES_IN_SECONDS,
  });
}

export function verifyAuthToken(token: string): number {
  const payload = jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"],
  });

  if (typeof payload === "string" || !payload.sub) {
    throw new AppError(
      401,
      "UNAUTHENTICATED",
      "Authentication required.",
    );
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError(
      401,
      "UNAUTHENTICATED",
      "Authentication required.",
    );
  }

  return userId;
}
