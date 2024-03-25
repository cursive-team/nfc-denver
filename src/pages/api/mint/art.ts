import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";

interface MintRequest {
  authToken: string;
  walletAddress: string;
  stringifiedPublicKeys: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { authToken, walletAddress, stringifiedPublicKeys }: MintRequest =
      req.body;

    if (!authToken || !walletAddress || !stringifiedPublicKeys) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userId = await verifyAuthToken(authToken);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired authToken" });
    }

    const existingMintRequest = await prisma.mintRequest.findFirst({
      where: { userId },
    });
    if (existingMintRequest) {
      return res
        .status(400)
        .json({ message: "User already has a mint request" });
    }

    await prisma.mintRequest.create({
      data: {
        userId: userId,
        walletAddress,
        stringifiedPublicKeys,
      },
    });

    return res.status(200).json({});
  } catch (error) {
    console.error("Request error: ", error);
    res.status(500).json({ message: "Error processing request" });
  }
}
