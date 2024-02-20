import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse, ItemWithRequirements } from "@/types";
import { itemWithRequirementsSelector } from "@/lib/server/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ItemWithRequirements | ErrorResponse>
) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (typeof id !== "string") {
      res.status(400).json({ error: "Invalid item ID" });
      return;
    }

    try {
      const item = await prisma.item.findFirst(itemWithRequirementsSelector);
      if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      res.status(200).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
