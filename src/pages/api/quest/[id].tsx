import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { Quest } from "@prisma/client";
import { ErrorResponse } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Quest | ErrorResponse>
) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (typeof id !== "string") {
      res.status(400).json({ error: "Invalid quest ID" });
      return;
    }

    try {
      const quest = await prisma.quest.findUnique({
        where: { id: parseInt(id) },
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

      if (!quest) {
        res.status(404).json({ error: "Quest not found" });
        return;
      }

      res.status(200).json(quest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
