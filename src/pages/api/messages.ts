import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "./_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { message, recipientPublicKey, token } = req.body;

    if (!message || !recipientPublicKey || !token) {
      res
        .status(400)
        .json({ error: "Missing message, recipientPublicKey, or token" });
      return;
    }

    // TODO: Should we require a cmac/iykRef to be passed in?

    const senderUserId = await verifyAuthToken(token);
    if (!senderUserId) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const sender = await prisma.user.findUnique({
      where: { id: senderUserId },
    });
    if (!sender) {
      res.status(404).json({ error: "Sender user not found" });
      return;
    }

    const recipient = await prisma.user.findFirst({
      where: { encryptionPublicKey: recipientPublicKey },
    });
    if (!recipient) {
      res.status(404).json({ error: "Recipient user not found" });
      return;
    }

    await prisma.message.create({
      data: {
        senderId: sender.id,
        recipientId: recipient.id,
        encryptedData: message,
      },
    });

    res.status(200).json({ success: "Message stored successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
