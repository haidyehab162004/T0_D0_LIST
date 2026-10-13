import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import { env } from "../config/env";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function generateResetToken(): string {
  return `reset_${randomBytes(32).toString("base64url")}`;
}

export function hashSensitiveValue(value: string): string {
  return createHmac("sha256", env.jwtSecret)
    .update(value)
    .digest("hex");
}

export function matchesSensitiveHash(
  value: string,
  expectedHash: string,
): boolean {
  const actual = Buffer.from(hashSensitiveValue(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
