import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/server/prisma";
import { object, string, boolean } from "yup";

export const MAX_SIGNIN_CODE_GUESS_ATTEMPTS = 5;

/**
 * Generates a one-time signin code as a 6 digit integer represented as a string, with leading zeros if necessary.
 * Send this code to the user via email.
 * @returns Boolean indicating success.
 */
export const generateAndSendSigninCode = async (
  email: string
): Promise<boolean> => {
  // Delete all signin codes associated with the email
  await prisma.signinCode.deleteMany({
    where: { email },
  });

  // Generate a one-time signin code as a 6 digit integer represented as a string, with leading zeros if necessary
  const newSigninCode = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  // Set the expiration time to 30 minutes from the current time
  // 30 minutes * 60 seconds per minute * 1000 milliseconds per second
  const expiresAt = new Date(new Date().getTime() + 30 * 60 * 1000);

  // Save the signin code and expiration time associated with the email in the database
  const signinCodeEntry = await prisma.signinCode.create({
    data: { value: newSigninCode, email, expiresAt, usedGuessAttempts: 0 },
  });
  const signinCode = signinCodeEntry.value;

  const response = await fetch(
    "https://platform.iyk.app/api/admin/eth-denver-login-email",
    {
      method: "POST",
      headers: {
        "x-cursive-secret": process.env.IYK_EMAIL_API_SECRET!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: email,
        code: signinCode,
      }),
    }
  );

  if (!response.ok) {
    console.error(`Error sending email to user ${email}: `, response);
    return false;
  }

  const { success } = await response.json();
  if (!success) {
    console.error("Failed to send email to user ${email}: ", response);
    return false;
  }

  return true;
};

export type AuthTokenResponse = {
  value: string;
  expiresAt: Date;
};

/**
 * Generates an auth token and stores it in the database for a given userId.
 * @param userId The user ID for which to generate and store the auth token.
 * @returns The generated auth token.
 */
export const generateAuthToken = async (
  userId: number
): Promise<AuthTokenResponse> => {
  const tokenValue = uuidv4();

  // Set default auth token expiry time to 2 weeks from now
  // 14 days, 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
  const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000;
  const twoWeeksFromNow = new Date(Date.now() + twoWeeksInMilliseconds);

  await prisma.authToken.create({
    data: {
      value: tokenValue,
      userId,
      expiresAt: twoWeeksFromNow,
    },
  });

  return { value: tokenValue, expiresAt: twoWeeksFromNow };
};

export enum VerifySigninCodeErrorReason {
  NO_CODE = "NO_CODE",
  OUT_OF_ATTEMPTS = "OUT_OF_ATTEMPTS",
  INVALID_CODE = "INVALID_CODE",
  EXPIRED_CODE = "EXPIRED_CODE",
  USED_CODE = "USED_CODE",
}

export type VerifySigninCodeResponse = {
  success: boolean;
  reason?: VerifySigninCodeErrorReason;
};

export const verifySigninCodeResponseSchema = object({
  success: boolean().required(),
  reason: string().oneOf(Object.values(VerifySigninCodeErrorReason)).optional(),
});

/**
 * Verifies a signin code for a given email.
 * @param email The email for which to verify the signin code.
 * @param code The signin code to verify.
 * @param redeemCode Whether to redeem the code if it is valid.
 * @returns A response indicating whether the signin code was verified successfully.
 */
export const verifySigninCode = async (
  email: string,
  code: string,
  redeemCode: boolean
): Promise<VerifySigninCodeResponse> => {
  const signinCodeEntry = await prisma.signinCode.findFirst({
    where: { email },
  });

  if (!signinCodeEntry) {
    return {
      success: false,
      reason: VerifySigninCodeErrorReason.NO_CODE,
    };
  }

  if (signinCodeEntry.usedGuessAttempts >= MAX_SIGNIN_CODE_GUESS_ATTEMPTS) {
    return {
      success: false,
      reason: VerifySigninCodeErrorReason.OUT_OF_ATTEMPTS,
    };
  }

  if (signinCodeEntry.expiresAt < new Date()) {
    return {
      success: false,
      reason: VerifySigninCodeErrorReason.EXPIRED_CODE,
    };
  }

  if (signinCodeEntry.redeemedAt !== null) {
    return {
      success: false,
      reason: VerifySigninCodeErrorReason.USED_CODE,
    };
  }

  if (signinCodeEntry.value !== code) {
    // Increment guess attempts if code is guessed incorrectly
    await prisma.signinCode.updateMany({
      where: { email },
      data: { usedGuessAttempts: { increment: 1 } },
    });

    return {
      success: false,
      reason: VerifySigninCodeErrorReason.INVALID_CODE,
    };
  }

  if (redeemCode) {
    await prisma.signinCode.update({
      where: { id: signinCodeEntry.id },
      data: { redeemedAt: new Date() },
    });
  }

  return { success: true };
};

/**
 * Verifies that an auth token is valid, and returns the user ID associated with it.
 * @param token - The auth token to verify.
 * @returns The user ID associated with the auth token, or undefined if the token is invalid.
 */
export const verifyAuthToken = async (
  token: string
): Promise<number | undefined> => {
  const tokenEntry = await prisma.authToken.findUnique({
    where: { value: token },
  });

  if (!tokenEntry) {
    return undefined;
  }

  if (tokenEntry.expiresAt < new Date()) {
    return undefined;
  }

  if (tokenEntry.revokedAt !== null && tokenEntry.revokedAt < new Date()) {
    return undefined;
  }

  return tokenEntry.userId;
};
