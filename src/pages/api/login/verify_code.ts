import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import {
  verifySigninCode,
  generateAuthToken,
  AuthTokenResponse,
} from "../_auth";
import { ErrorResponse } from "../_types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthTokenResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const verifyResponse = await verifySigninCode(email, code, true);
  if (!verifyResponse.success) {
    return res
      .status(401)
      .json({ error: verifyResponse.reason || "Code verification failed" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const authToken = await generateAuthToken(user.id);
  return res.status(200).json(authToken);
}
