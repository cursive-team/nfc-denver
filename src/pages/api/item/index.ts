import { verifyAuthToken } from "@/lib/server/auth";
import { itemWithRequirementsSelector } from "@/lib/server/database";
import { isUserAdmin } from "@/lib/server/dev";
import prisma from "@/lib/server/prisma";
import { ItemWithRequirements } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { array, number, object, string } from "yup";

export type ItemCreateRequest = {
  token: string;
  name: string;
  sponsor: string;
  description: string;
  buidlCost: number;
  questReqIds: string[];
  imageUrl: string;
};

const itemCreateRequestSchema = object().shape({
  token: string().required("Token is required"),
  name: string().required("Item name is required"),
  sponsor: string().required("Sponsor is required"),
  description: string().required("Description is required"),
  buidlCost: number().required("Buidl cost is required"),
  questReqIds: array()
    .of(string().required())
    .required("Quest requirement ids are required"),
  imageUrl: string().required("Image URL is required"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { token } = req.query;

    if (typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    const userId = await verifyAuthToken(token);
    if (!userId) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const items: ItemWithRequirements[] = await prisma.item.findMany(
      itemWithRequirementsSelector
    );

    return res.status(200).json(items);
  } else if (req.method === "POST") {
    try {
      const {
        token,
        name,
        sponsor,
        description,
        buidlCost,
        questReqIds,
        imageUrl,
      } = await itemCreateRequestSchema.validate(req.body);

      const userId = await verifyAuthToken(token);
      if (!userId) {
        return res.status(400).json({ error: "Invalid token" });
      }

      if (!isUserAdmin(userId)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const item = await prisma.item.create({
        data: {
          name,
          sponsor,
          description,
          buidlCost,
          imageUrl,
          questRequirements: {
            connect: questReqIds.map((id) => ({ id: parseInt(id) })),
          },
        },
      });

      return res.status(200).json({ itemId: item.id });
    } catch (error) {
      console.error("Item creation failed", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
