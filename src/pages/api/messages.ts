import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "../../lib/server/auth";
import { EmptyResponse, ErrorResponse } from "../../types";
import { EncryptedMessage } from "@/lib/client/jubSignal";

export type MessageGetResponse = EncryptedMessage[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageGetResponse | EmptyResponse | ErrorResponse>
) {
  if (req.method === "GET") {
    const { token, startDate } = req.query;

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
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (typeof startDate !== "string" || isNaN(Date.parse(startDate))) {
      res.status(400).json({ error: "Invalid startDate" });
      return;
    }

    const receivedMessages = await prisma.message.findMany({
      where: {
        recipientId: userId,
        createdAt: {
          gte: new Date(startDate),
        },
      },
      include: {
        sender: {
          select: {
            displayName: true,
            encryptionPublicKey: true,
          },
        },
      },
    });

    const messages: EncryptedMessage[] = receivedMessages.map((message) => ({
      toPublicKey: user.encryptionPublicKey,
      fromPublicKey: message.sender.encryptionPublicKey,
      fromDisplayName: message.sender.displayName,
      encryptedContents: message.encryptedData,
      timestamp: message.createdAt,
    }));

    res.status(200).json(messages);
  } else if (req.method === "POST") {
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

    res.status(200).json({});
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
