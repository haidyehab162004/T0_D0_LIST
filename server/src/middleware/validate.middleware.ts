import type { RequestHandler } from "express";
import type { ZodError, ZodType } from "zod";

import { AppError } from "../utils/app-error";

export interface RequestValidation {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

function validationErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "request";

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

function throwValidationError(error: ZodError): never {
  throw new AppError(
    400,
    "VALIDATION_ERROR",
    "Invalid request.",
    validationErrors(error),
  );
}

export function validateRequest(validation: RequestValidation): RequestHandler {
  return (request, _response, next) => {
    if (validation.body) {
      const result = validation.body.safeParse(request.body);

      if (!result.success) {
        throwValidationError(result.error);
      }

      // Controllers receive the cleaned body after Zod trim/transform logic.
      request.body = result.data;
    }

    if (validation.params) {
      const result = validation.params.safeParse(request.params);

      if (!result.success) {
        throwValidationError(result.error);
      }
    }

    if (validation.query) {
      const result = validation.query.safeParse(request.query);

      if (!result.success) {
        throwValidationError(result.error);
      }
    }

    next();
  };
}
