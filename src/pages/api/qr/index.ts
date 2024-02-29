import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";

export type QRCodeResponseType = {
  id: string;
  quest: {
    item: {
      id: number;
      name: string;
      sponsor: string;
      description: string;
      buidlCost: number;
      imageUrl: string;
    } | null;
  };
  user: {
    id: number;
    displayName: string;
    encryptionPublicKey: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QRCodeResponseType | ErrorResponse>
) {
  if (req.method === "GET") {
    const { id, token } = req.query;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "ID must be a string" });
    }

    if (typeof token !== "string") {
      return res.status(400).json({ error: "Token must be a string" });
    }

    const isAdmin = await isUserAdmin(token);
    if (!isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const questProof = await prisma.questProof.findUnique({
      where: { id },
      include: {
        quest: {
          select: {
            item: {
              select: {
                id: true,
                name: true,
                sponsor: true,
                description: true,
                buidlCost: true,
                imageUrl: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            encryptionPublicKey: true,
          },
        },
      },
    });
    if (!questProof) {
      return res.status(404).json({ error: "QR code not found" });
    }

    res.status(200).json(questProof);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
