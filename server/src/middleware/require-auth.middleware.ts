import type { RequestHandler } from "express";

import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { verifyAuthToken } from "../utils/auth-token";

function readCookie(cookieHeader: string | undefined, cookieName: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const cookie = part.trim();
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex);

    if (name === cookieName) {
      return cookie.slice(separatorIndex + 1);
    }
  }

  return undefined;
}

export const requireAuth: RequestHandler = (request, _response, next) => {
  const token = readCookie(request.headers.cookie, env.authCookieName);

  if (!token) {
    throw new AppError(
      401,
      "UNAUTHENTICATED",
      "Authentication required.",
    );
  }

  const userId = verifyAuthToken(token);

  request.auth = { userId };

  next();
};
