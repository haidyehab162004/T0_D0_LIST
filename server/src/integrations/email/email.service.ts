import nodemailer from "nodemailer";

import { env } from "../../config/env";

function createTransport() {
  if (!env.smtpHost || !env.smtpFrom) {
    throw new Error(
      "Email is not configured. Set SMTP_HOST and SMTP_FROM in the server environment.",
    );
  }

  const hasUser = Boolean(env.smtpUser);
  const hasPassword = Boolean(env.smtpPass);

  if (hasUser !== hasPassword) {
    throw new Error(
      "SMTP_USER and SMTP_PASS must either both be configured or both be omitted.",
    );
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    ...(hasUser
      ? {
          auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
          },
        }
      : {}),
  });
}

async function sendOtpEmail(
  to: string,
  subject: string,
  purpose: string,
  otp: string,
): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text: `${purpose}: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`,
  });
}

export async function sendVerificationOtp(email: string, otp: string): Promise<void> {
  await sendOtpEmail(
    email,
    "Verify your Todo account",
    "Your verification code",
    otp,
  );
}

export async function sendPasswordResetOtp(email: string, otp: string): Promise<void> {
  await sendOtpEmail(
    email,
    "Reset your Todo password",
    "Your password reset code",
    otp,
  );
}
