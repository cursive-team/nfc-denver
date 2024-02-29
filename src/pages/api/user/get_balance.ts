import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";
import {
  getClaveInviteLink,
  getUserLocalBuidlBalance,
} from "@/lib/server/clave";
import { ClaveInfo } from "@/lib/client/clave";
import { ErrorResponse } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaveInfo | ErrorResponse>
) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Extract the token from the query parameters
    const token = req.query.token as string;
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing" });
    }

    const userId = await verifyAuthToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const buidlBalance = await getUserLocalBuidlBalance(user.id);
    const claveWalletAddress = user.claveWallet ? user.claveWallet : undefined;
    const claveInviteLink = await getClaveInviteLink(
      user.email,
      user.claveInviteCode
    );

    return res.status(200).json({
      buidlBalance,
      claveWalletAddress,
      claveInviteLink,
    });
  } catch (error) {
    console.error("Error fetching user balance and clave details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
