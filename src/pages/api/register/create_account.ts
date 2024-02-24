import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { object, string, boolean } from "yup";
import { ErrorResponse } from "@/types";
import {
  ChipType,
  getChipIdFromIykCmac,
  getChipTypeFromChipId,
  verifyEmailForChipId,
} from "@/lib/server/dev";
import {
  AuthTokenResponse,
  generateAuthToken,
  verifySigninCode,
} from "@/lib/server/auth";
import { displayNameRegex } from "@/lib/shared/utils";

const createAccountSchema = object({
  cmac: string().required(),
  email: string().email().required(),
  code: string().required(),
  displayName: string().required(),
  wantsServerCustody: boolean().required(),
  allowsAnalytics: boolean().required(),
  encryptionPublicKey: string().required(),
  signaturePublicKey: string().required(),
  passwordSalt: string().optional(),
  passwordHash: string().optional(),
});

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
    wantsServerCustody,
    allowsAnalytics,
    encryptionPublicKey,
    signaturePublicKey,
    passwordSalt,
    passwordHash,
  } = validatedData;

  if (!displayNameRegex.test(displayName)) {
    return res.status(400).json({
      error:
        "Invalid display name. Must be alphanumeric and less than 20 characters",
    });
  }

  // Validate cmac corresponds to an unregistered person chip
  const { chipId } = getChipIdFromIykCmac(cmac);
  if (chipId === undefined) {
    return res.status(400).json({ error: "Invalid cmac" });
  }
  const chipType = getChipTypeFromChipId(chipId);
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

  const emailMatchesChipId = verifyEmailForChipId(chipId, email);
  if (!emailMatchesChipId) {
    return res.status(400).json({ error: "Email does not match cmac" });
  }

  // Verify the signin code is valid
  const verifySigninCodeResult = await verifySigninCode(email, code, true);
  if (!verifySigninCodeResult.success) {
    return res.status(400).json({ error: "Invalid email code" });
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      chipId,
      email,
      displayName,
      wantsServerCustody,
      allowsAnalytics,
      encryptionPublicKey,
      signaturePublicKey,
      passwordSalt,
      passwordHash,
    },
  });

  const authTokenResponse = await generateAuthToken(user.id);

  return res.status(200).json(authTokenResponse);
}
