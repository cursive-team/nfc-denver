import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { EmptyResponse, ErrorResponse } from "@/types";
import { generateAndSendSigninCode } from "@/lib/server/auth";
import { getChipIdFromIykCmac, verifyEmailForChipId } from "@/lib/server/dev";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmptyResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, cmac } = req.body;
  if (!email || !cmac) {
    return res.status(400).json({ error: "Email and cmac are required" });
  }

  const { chipId } = getChipIdFromIykCmac(cmac);
  if (!chipId) {
    return res.status(400).json({ error: "Invalid cmac" });
  }

  const emailMatchesChipId = verifyEmailForChipId(chipId, email);
  if (!emailMatchesChipId) {
    return res.status(400).json({ error: "Email does not match cmac" });
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
