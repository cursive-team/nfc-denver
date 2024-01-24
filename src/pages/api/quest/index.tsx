import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";
import { EmptyResponse, ErrorResponse } from "@/types";
import { Quest, User, Location } from "@prisma/client";

export type QuestGetResponse = Quest[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuestGetResponse | EmptyResponse | ErrorResponse>
) {
  if (req.method === "GET") {
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

    const quests = await prisma.quest.findMany({
      include: {
        userReqs: {
          select: {
            displayName: true,
          },
        },
        userPartialReqs: {
          select: {
            displayName: true,
          },
        },
        locationReqs: {
          select: {
            name: true,
          },
        },
        locationPartialReqs: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json(quests);
  } else if (req.method === "POST") {
    const {
      token,
      name,
      description,
      buidlReward,
      userReqChipIds,
      userPartialReqChipIds,
      userPartialCt,
      locationReqChipIds,
      locationPartialReqChipIds,
      locationPartialCt,
    } = req.body;

    if (
      !name ||
      !description ||
      !buidlReward ||
      !userReqChipIds ||
      !userPartialReqChipIds ||
      !locationReqChipIds ||
      !locationPartialReqChipIds
    ) {
      res.status(400).json({ error: "Missing necessary quest data" });
      return;
    }

    const senderUserId = await verifyAuthToken(token);
    if (!senderUserId) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    for (const userChipId of userReqChipIds) {
      const user = await prisma.user.findUnique({
        where: {
          chipId: userChipId,
        },
      });
      if (!user) {
        res.status(404).json({ error: `User chipId ${userChipId} not found` });
        return;
      }
    }

    for (const userChipId of userPartialReqChipIds) {
      const user = await prisma.user.findUnique({
        where: {
          chipId: userChipId,
        },
      });
      if (!user) {
        res.status(404).json({ error: `User chipId ${userChipId} not found` });
        return;
      }
    }

    for (const locationChipId of locationReqChipIds) {
      const location = await prisma.location.findUnique({
        where: {
          chipId: locationChipId,
        },
      });
      if (!location) {
        res
          .status(404)
          .json({ error: `Location chipId ${locationChipId} not found` });
        return;
      }
    }

    for (const locationChipId of locationPartialReqChipIds) {
      const location = await prisma.location.findUnique({
        where: {
          chipId: locationChipId,
        },
      });
      if (!location) {
        res
          .status(404)
          .json({ error: `Location chipId ${locationChipId} not found` });
        return;
      }
    }

    const quest = await prisma.quest.create({
      data: {
        name,
        description,
        buidlReward,
        userReqs: {
          connect: userReqChipIds.map((chipId: number) => {
            chipId: chipId;
          }),
        },
        locationReqs: {
          connect: locationReqChipIds.map((chipId: number) => {
            chipId: chipId;
          }),
        },
        userPartialReqs: {
          connect: userPartialReqChipIds.map((chipId: number) => {
            chipId: chipId;
          }),
        },
        locationPartialReqs: {
          connect: locationPartialReqChipIds.map((chipId: number) => {
            chipId: chipId;
          }),
        },
        userPartialCt: userPartialCt || 0,
        locationPartialCt: locationPartialCt || 0,
      },
    });

    res.status(200).json(quest);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
