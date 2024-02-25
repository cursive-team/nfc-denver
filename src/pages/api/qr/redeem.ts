import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";

export type QRCodeRedemptionType = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QRCodeRedemptionType | ErrorResponse>
) {
  if (req.method === "POST") {
    const { token, id } = req.body;
    if (typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    // User must be admin to redeem a QR code
    const isAdmin = await isUserAdmin(token);
    if (!isAdmin) {
      return res.status(403).json({ error: "You are not an admin" });
    }

    if (typeof id !== "string") {
      return res.status(400).json({ error: "ID must be a string" });
    }

    const qrCode = await prisma.qrCode.findUnique({
      where: { id },
    });
    if (!qrCode) {
      return res.status(404).json({ error: "QR code not found" });
    }

    if (qrCode.redeemed) {
      return res.status(200).json({ success: false });
    }

    // Invalidate the qr code
    await prisma.qrCode.update({
      where: { id },
      data: { redeemed: true },
    });

    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
