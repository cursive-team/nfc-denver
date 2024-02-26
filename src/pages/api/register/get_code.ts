import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { EmptyResponse, ErrorResponse } from "@/types";
import { generateAndSendSigninCode } from "@/lib/server/auth";
import { getChipIdFromIykRef, verifyEmailForChipId } from "@/lib/server/iyk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmptyResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, iykRef, mockRef } = req.body;
  if (!email || !iykRef) {
    return res.status(400).json({ error: "Email and iykRef are required" });
  }

  const enableMockRef = mockRef === "true";
  const { chipId } = await getChipIdFromIykRef(iykRef, enableMockRef);
  if (!chipId) {
    return res.status(400).json({ error: "Invalid iykRef" });
  }

  const emailMatchesChipId = verifyEmailForChipId(chipId, email);
  if (!emailMatchesChipId) {
    return res.status(400).json({ error: "Email does not match iykRef" });
  }

  // Check if email is already registered
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    console.error("Email already registered");
    return res.status(400).json({ error: "Email already registered" });
  }

  const sentSigninCode = await generateAndSendSigninCode(email);
  if (sentSigninCode) {
    return res.status(200).json({});
  } else {
    return res.status(500).json({ error: "Error sending email" });
  }
}
