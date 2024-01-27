import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Extract the token and queryDate from the query parameters
    const { token, queryTime } = req.query;

    if (
      !token ||
      !queryTime ||
      typeof token !== "string" ||
      typeof queryTime !== "string"
    ) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    // Validate the token and retrieve the userId associated with it
    const authToken = await prisma.authToken.findUnique({
      where: { value: token },
    });

    if (!authToken || authToken.expiresAt < new Date()) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Parse the queryTime and validate it
    const parsedQueryTime = new Date(queryTime);
    if (isNaN(parsedQueryTime.getTime())) {
      res.status(400).json({ error: "Invalid queryTime format" });
      return;
    }

    // Retrieve all messages before the given date for the user
    const messages = await prisma.benchmarkMessage.findMany({
      where: {
        recipientId: authToken.userId,
        createdAt: {
          gt: parsedQueryTime,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Delete all messages for this user's benchmarks
    await prisma.benchmarkMessage.deleteMany({
      where: {
        recipientId: authToken.userId,
      },
    });

    res.status(200).json({ benchmarkMessages: messages });
  } else if (req.method === "POST") {
    const { token, messages } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    // Validate the token and retrieve the userId associated with it
    const authToken = await prisma.authToken.findUnique({
      where: { value: token },
    });

    if (!authToken || authToken.expiresAt < new Date()) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const senderId = authToken.userId;
    const recipientId = authToken.userId;
    const messageData = Object.entries(messages).map(
      ([benchmarkId, message]) => ({
        benchmarkId: parseInt(benchmarkId),
        senderId,
        recipientId,
        encryptedData: message as string,
      })
    );

    try {
      const createdMessages = await prisma.benchmarkMessage.createMany({
        data: messageData,
      });

      res.status(200).json({ numMessagesReceived: createdMessages.count });
    } catch (error) {
      console.error("Failed to insert messages into the database", error);
      res
        .status(500)
        .json({ error: "Failed to insert messages into the database" });
      return;
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
