import { OAuth2Client } from "google-auth-library";

import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";

export interface GoogleProfile {
  providerAccountId: string;
  email: string;
  name: string;
}

const googleClient = new OAuth2Client();

export async function verifyGoogleCredential(
  credential: string,
): Promise<GoogleProfile> {
  if (!env.googleClientId) {
    throw new Error(
      "Google authentication is not configured. Set GOOGLE_CLIENT_ID in the server environment.",
    );
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      throw new Error("Google token is missing a verified identity.");
    }

    const email = payload.email.trim().toLowerCase();
    const name =
      payload.name?.trim() ||
      email.split("@")[0] ||
      "Google User";

    return {
      providerAccountId: payload.sub,
      email,
      name,
    };
  } catch {
    throw new AppError(
      401,
      "INVALID_GOOGLE_CREDENTIAL",
      "Google authentication failed.",
    );
  }
}
