import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";
import { verify } from "@/lib/shared/signature";
import { getNonceFromCounterMessage } from "@/lib/client/libhalo";
const sha256 = require("js-sha256");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { locationId, token, signature, message } = req.body;

    const userId = await verifyAuthToken(token);
    if (!userId) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      return res.status(400).json({ error: "Invalid location id" });
    }

    // Ensure user has not visited this location before
    const previousMint = await prisma.emailWalletMint.findFirst({
      where: {
        userId,
        locationId,
      },
    });
    if (previousMint) {
      return res
        .status(400)
        .json({ error: "User has already visited this location" });
    }

    // Ensure signature has not been used before
    const sigHash = sha256(signature);
    const usedMintSignature = await prisma.emailWalletMint.findFirst({
      where: {
        sigHash,
      },
    });
    if (usedMintSignature) {
      return res.status(400).json({ error: "Signature has already been used" });
    }

    // Ensure signature is valid
    if (!verify(location.signaturePublicKey, message, signature)) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Get nonce from signature message
    const nonce = getNonceFromCounterMessage(message);
    if (!nonce) {
      return res.status(400).json({ error: "Invalid signature message" });
    }

    // Remove any "+" from user email
    const sanitizedEmail = user.email.replace(/\+.+?(?=@)/, "");

    // Call email wallet minting service
    const response = await fetch("http://api.emailwallet.org/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailAddress: sanitizedEmail,
        locationId: location.id,
        locationName: location.name,
        imageUrl: location.imageUrl,
        nonce,
      }),
    });
    if (!response.ok) {
      return res.status(500).json({ error: "Email wallet minting failed" });
    }

    // Save mint to database
    await prisma.emailWalletMint.create({
      data: {
        userId,
        locationId,
        sigHash,
      },
    });

    res.status(200).json({});
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
