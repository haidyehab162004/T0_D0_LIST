import type { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { AppError } from "../utils/app-error";

function isMalformedJsonError(error: unknown): boolean {
  if (!(error instanceof SyntaxError) || typeof error !== "object" || error === null) {
    return false;
  }

  return "status" in error && error.status === 400 && "body" in error;
}

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });

    return;
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    response.status(401).json({
      code: "UNAUTHENTICATED",
      message: "Authentication required.",
    });

    return;
  }

  if (isMalformedJsonError(error)) {
    response.status(400).json({
      code: "INVALID_JSON",
      message: "Request body contains invalid JSON.",
    });

    return;
  }

  console.error(error);

  response.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected server error occurred.",
  });
};
