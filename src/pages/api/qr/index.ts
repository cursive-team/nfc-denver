import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";

export type QRCodeResponseType = {
  id: string;
  item: {
    id: number;
    name: string;
    sponsor: string;
    description: string;
    buidlCost: number;
    imageUrl: string;
  };
  user: {
    encryptionPublicKey: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QRCodeResponseType | ErrorResponse>
) {
  if (req.method === "GET") {
    const { id } = req.query;
    if (typeof id !== "string") {
      return res.status(400).json({ error: "ID must be a string" });
    }

    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
      include: {
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
        user: {
          select: {
            encryptionPublicKey: true,
          },
        },
      },
    });

    if (!qrCode) {
      return res.status(404).json({ error: "QR code not found" });
    }

    res.status(200).json(qrCode);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
