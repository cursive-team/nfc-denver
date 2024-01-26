import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";

interface ValidateRequirementBody {
  type: "USER" | "LOCATION";
  ids: string[];
}

export default async function validateRequirement(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, ids }: ValidateRequirementBody = req.body;

  if (!type || !ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const numIds = ids.map((id) => parseInt(id));

  try {
    if (type === "USER") {
      const users = await prisma.user.findMany({
        where: {
          id: { in: numIds },
        },
        select: { id: true },
      });
      const foundIds = users.map((user) => user.id);
      const allExist = numIds.every((id) => foundIds.includes(id));
      return res.status(200).json({ valid: allExist });
    } else if (type === "LOCATION") {
      const locations = await prisma.location.findMany({
        where: {
          id: { in: numIds },
        },
        select: { id: true },
      });
      const foundIds = locations.map((location) => location.id);
      const allExist = numIds.every((id) => foundIds.includes(id));
      return res.status(200).json({ valid: allExist });
    } else {
      return res.status(400).json({ error: "Invalid requirement type" });
    }
  } catch (error) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error validating requirement" });
  }
}
