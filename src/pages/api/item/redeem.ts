import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { verifyAuthToken } from "@/lib/server/auth";
import { getBuidlBalance } from "@/lib/server/dev";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ qrCodeId: string } | ErrorResponse>
) {
  if (req.method === "POST") {
    const { itemId, token } = req.body;

    if (!itemId || typeof itemId !== "number") {
      return res.status(400).json({ error: "Invalid or missing itemId" });
    }

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid or missing token" });
    }

    const userId = await verifyAuthToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        buidlCost: true,
        questRequirements: {
          select: { id: true },
        },
      },
    });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // If the user has previously generated a qr code for this item, just return it
    const previousQrCode = await prisma.qrCode.findFirst({
      where: { itemId: item.id, userId, redeemed: false },
    });
    if (previousQrCode) {
      return res.status(200).json({ qrCodeId: previousQrCode.id });
    }

    // Check if user has enough buidl
    const userBuidlBalance = await getBuidlBalance(userId);
    if (userBuidlBalance < item.buidlCost) {
      return res.status(403).json({ error: "Insufficient BUIDL balance" });
    }

    // Check user has completed all quests for this item
    const completedQuestProofs = await prisma.questProof.findMany({
      where: { userId },
      select: { id: true, questId: true },
    });
    const completedQuestIds = completedQuestProofs.map(
      (proof) => proof.questId
    );
    for (const questReqId of item.questRequirements.map((qr) => qr.id)) {
      if (!completedQuestIds.includes(questReqId)) {
        return res
          .status(403)
          .json({ error: "User has not completed required quest" });
      }
    }

    // Proofs are valid, create a qr code for this item
    const qrCode = await prisma.qrCode.create({
      data: {
        itemId: item.id,
        userId,
        redeemed: false,
      },
    });

    return res.status(200).json({ qrCodeId: qrCode.id });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
