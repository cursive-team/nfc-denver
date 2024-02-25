import { NextApiRequest, NextApiResponse } from "next";
import { head } from "@vercel/blob";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";

export type LocationRegistrationResponse = {
  locationId: Number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationRegistrationResponse | ErrorResponse>
) {
  if (req.method === "POST") {
    const {
      token,
      signaturePublicKey,
      name,
      description,
      sponsor,
      imageUrl,
      emailWallet,
    } = req.body;

    if (
      typeof token !== "string" ||
      typeof signaturePublicKey !== "string" ||
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof sponsor !== "string" ||
      typeof imageUrl !== "string"
    ) {
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    const isAdmin = isUserAdmin(token);
    if (!isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check that location is not already registered
    const existingLocation = await prisma.location.findFirst({
      where: {
        signaturePublicKey,
      },
    });
    if (existingLocation) {
      return res.status(400).json({ error: "Location already registered" });
    }

    // Check that location is allowed to be registered
    const registration = await prisma.sigChipRegistration.findFirst({
      where: {
        signaturePublicKey,
      },
    });
    if (!registration) {
      return res
        .status(400)
        .json({ error: "Location not allowed to register" });
    }

    // Check that user uploaded location image to vercel blob
    try {
      await head(imageUrl);
    } catch (error) {
      return res.status(400).json({ error: "Invalid image url" });
    }

    const location = await prisma.location.create({
      data: {
        chipId: signaturePublicKey,
        name,
        description,
        sponsor,
        imageUrl,
        signaturePublicKey,
        displayEmailWalletLink: emailWallet,
      },
    });

    return res.status(200).json({ locationId: location.id });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
