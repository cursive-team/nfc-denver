import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { verifyAuthToken } from "@/lib/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { passwordSalt: string | null; passwordHash: string | null } | ErrorResponse
  >
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token } = req.query;

  if (typeof token !== "string") {
    res.status(400).json({ error: "Invalid token" });
    return;
  }

  const userId = await verifyAuthToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordSalt: true, passwordHash: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User or password hash not found" });
  }

  return res.status(200).json(user);
}
