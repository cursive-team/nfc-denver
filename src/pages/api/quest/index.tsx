import { NextApiRequest, NextApiResponse } from "next";
import { object, string, array, number, mixed } from "yup";
import { Quest } from "@prisma/client";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";
import { ErrorResponse } from "@/types";

export type QuestRequirementRequest = {
  type: "USER" | "LOCATION";
  ids: string[];
  numSigsRequired: number;
};

const questRequirementRequestSchema = object().shape({
  type: mixed()
    .oneOf(["USER", "LOCATION"])
    .required("Requirement type is required"),
  ids: array()
    .of(string().required("ID is required"))
    .required("IDs are required"),
  numSigsRequired: number()
    .min(1, "At least one signature is required")
    .required("Number of signatures required is required"),
});

export type QuestCreateRequest = {
  token: string;
  name: string;
  description: string;
  buidlReward: number;
  requirements: QuestRequirementRequest[];
};

const questCreateRequestSchema = object().shape({
  token: string().required("Token is required"),
  name: string().required("Quest name is required"),
  description: string().required("Quest description is required"),
  buidlReward: number().required("Buidl reward is required"),
  requirements: array()
    .of(questRequirementRequestSchema)
    .required("Requirements are required"),
});

export type QuestCreateResponse = {
  id: number;
};

export type QuestGetResponse = Quest[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuestGetResponse | QuestCreateResponse | ErrorResponse>
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
        userRequirements: {
          include: {
            users: {
              select: {
                displayName: true,
              },
            },
          },
        },
        locationRequirements: {
          include: {
            locations: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json(quests);
  } else if (req.method === "POST") {
    try {
      const { token, name, description, buidlReward, requirements } =
        await questCreateRequestSchema.validate(req.body);

      const senderUserId = await verifyAuthToken(token);
      if (!senderUserId) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }

      if (requirements.length === 0) {
        res
          .status(400)
          .json({ error: "Quest must have at least one requirement" });
        return;
      }

      const userRequirements: QuestRequirementRequest[] = [];
      const locationRequirements: QuestRequirementRequest[] = [];
      requirements.forEach((requirement: any) => {
        if (
          parseInt(requirement.numSigsRequired) <= 0 ||
          parseInt(requirement.numSigsRequired) > requirement.ids.length
        ) {
          res
            .status(400)
            .json({ error: "Invalid number of signatures required" });
          return;
        }

        if (requirement.type === "USER") {
          userRequirements.push(requirement);
        } else if (requirement.type === "LOCATION") {
          locationRequirements.push(requirement);
        }
      });

      const quest = await prisma.quest.create({
        data: {
          name,
          description,
          buidlReward,
          userRequirements: {
            create: userRequirements.map((req) => ({
              userIds: req.ids.map((id) => parseInt(id)),
              numSigsRequired: req.numSigsRequired,
            })),
          },
          locationRequirements: {
            create: locationRequirements.map((req) => ({
              locationIds: req.ids.map((id) => parseInt(id)),
              numSigsRequired: req.numSigsRequired,
            })),
          },
        },
      });

      return res.status(200).json({ id: quest.id });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Failed to validate request" });
      return;
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
