import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { generateAndSendSigninCode } from "@/lib/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return res.status(400).json({ error: "Email not registered" });
  }

  const success = await generateAndSendSigninCode(email);
  if (success) {
    res.status(200).json(true);
  } else {
    res.status(500).json({ error: "Failed to send signin code" });
  }
}
