import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { object, string, boolean } from "yup";
import { ErrorResponse } from "../tap";

export const MAX_SIGNIN_CODE_GUESS_ATTEMPTS = 3;

export enum VerifyCodeErrorReason {
  NO_CODE = "NO_CODE",
  OUT_OF_ATTEMPTS = "OUT_OF_ATTEMPTS",
  INVALID_CODE = "INVALID_CODE",
  EXPIRED_CODE = "EXPIRED_CODE",
}

export type VerifyCodeResponse = {
  success: boolean;
  reason?: VerifyCodeErrorReason;
};

export const verifyCodeResponseSchema = object({
  success: boolean().required(),
  reason: string().oneOf(Object.values(VerifyCodeErrorReason)).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyCodeResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  try {
    const signinCodeEntry = await prisma.signinCode.findFirst({
      where: { email: email },
    });

    if (!signinCodeEntry) {
      return res.status(200).json({
        success: false,
        reason: VerifyCodeErrorReason.NO_CODE,
      });
    }

    if (signinCodeEntry.usedGuessAttempts >= MAX_SIGNIN_CODE_GUESS_ATTEMPTS) {
      return res.status(200).json({
        success: false,
        reason: VerifyCodeErrorReason.OUT_OF_ATTEMPTS,
      });
    }

    if (signinCodeEntry.expiresAt < new Date()) {
      return res.status(200).json({
        success: false,
        reason: VerifyCodeErrorReason.EXPIRED_CODE,
      });
    }

    if (signinCodeEntry.value !== code) {
      // Increment guess attempts for the email provided
      await prisma.signinCode.updateMany({
        where: { email: email },
        data: { usedGuessAttempts: { increment: 1 } },
      });

      return res.status(200).json({
        success: false,
        reason: VerifyCodeErrorReason.INVALID_CODE,
      });
    }

    // We don't update redeemedAt until the user creates their account

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error verifying code", error);
    return res.status(500).json({ error: "Error verifying code" });
  }
}
