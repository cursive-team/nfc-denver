import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ valid: boolean } | ErrorResponse>
) {
  if (req.method === "POST") {
    const { questReqIds } = req.body;

    if (
      !Array.isArray(questReqIds) ||
      questReqIds.some((id) => typeof id !== "string")
    ) {
      return res.status(400).json({ error: "Invalid questReqIds parameter" });
    }

    try {
      const quests = await prisma.quest.findMany({
        where: {
          id: {
            in: questReqIds.map((id) => parseInt(id)),
          },
        },
      });

      const isValid = quests.length === questReqIds.length;
      return res.status(200).json({ valid: isValid });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
