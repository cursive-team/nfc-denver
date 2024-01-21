import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { object, string, boolean } from "yup";
import { EmptyResponse, ErrorResponse } from "../_types";
import {
  ChipType,
  TODO_getChipIdFromIykCmac,
  TODO_getChipTypeFromChipId,
} from "../_iyk";
import { MAX_SIGNIN_CODE_GUESS_ATTEMPTS } from "./verify_code";
import { generateAuthToken } from "../_auth";

const createAccountSchema = object({
  cmac: string().required(),
  email: string().email().required(),
  code: string().required(),
  displayName: string().required(),
  twitterUsername: string().optional(),
  telegramUsername: string().optional(),
  wantsServerCustody: boolean().required(),
  encryptionPublicKey: string().required(),
  signaturePublicKey: string().required(),
  passwordSalt: string().optional(),
  passwordHash: string().optional(),
});

export type AuthTokenResponse = {
  authToken: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthTokenResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let validatedData;
  try {
    validatedData = await createAccountSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    console.error("Account creation failed", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  if (!validatedData) {
    return res.status(500).json({ error: "Internal Server Error" });
  }

  const {
    cmac,
    email,
    code,
    displayName,
    twitterUsername,
    telegramUsername,
    wantsServerCustody,
    encryptionPublicKey,
    signaturePublicKey,
    passwordSalt,
    passwordHash,
  } = validatedData;

  // Validate cmac corresponds to an unregistered person chip
  const { chipId } = TODO_getChipIdFromIykCmac(cmac);
  if (chipId === undefined) {
    return res.status(400).json({ error: "Invalid cmac" });
  }
  const chipType = TODO_getChipTypeFromChipId(chipId);
  if (chipType !== ChipType.PERSON) {
    return res.status(400).json({ error: "Invalid cmac" });
  }
  const existingUser = await prisma.user.findUnique({
    where: {
      chipId,
    },
  });
  if (existingUser) {
    return res.status(400).json({ error: "Card already registered" });
  }

  // Validate signin code is still valid
  // This should not happen in a typical user flow
  const signinCodeEntry = await prisma.signinCode.findFirst({
    where: { email },
  });
  if (
    !signinCodeEntry ||
    signinCodeEntry.usedGuessAttempts >= MAX_SIGNIN_CODE_GUESS_ATTEMPTS ||
    signinCodeEntry.expiresAt < new Date() ||
    signinCodeEntry.redeemedAt !== null
  ) {
    return res.status(400).json({ error: "Invalid email code" });
  }
  if (signinCodeEntry.value !== code) {
    await prisma.signinCode.updateMany({
      where: { email },
      data: { usedGuessAttempts: { increment: 1 } },
    });
    return res.status(400).json({ error: "Invalid email code" });
  }

  // Redeem signin code
  await prisma.signinCode.update({
    where: { id: signinCodeEntry.id },
    data: { redeemedAt: new Date() },
  });

  // Create user
  const user = await prisma.user.create({
    data: {
      chipId,
      email,
      displayName,
      twitterUsername,
      telegramUsername,
      wantsServerCustody,
      encryptionPublicKey,
      signaturePublicKey,
      passwordSalt,
      passwordHash,
    },
  });

  const authToken = await generateAuthToken(user.id);

  return res.status(200).json({ authToken });
}
