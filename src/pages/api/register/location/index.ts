import { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { getChipIdFromIykCmac } from "@/lib/server/dev";
import { generateSignatureKeyPair } from "@/lib/server/signature";

export type LocationRegistrationResponse = {
  locationId: Number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationRegistrationResponse | ErrorResponse>
) {
  if (req.method === "POST") {
    const { cmac, name, description, sponsor } = req.query;

    if (
      typeof cmac !== "string" ||
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof sponsor !== "string"
    ) {
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    const { chipId } = getChipIdFromIykCmac(cmac);
    if (!chipId) {
      return res.status(400).json({ error: "Invalid cmac" });
    }

    const existingLocation = await prisma.location.findUnique({
      where: {
        chipId,
      },
    });
    if (existingLocation) {
      return res.status(400).json({ error: "Location already registered" });
    }

    const filename = "locationImages/" + chipId + ".png";
    let blob;
    try {
      blob = await put(filename, req, {
        access: "public",
      });
    } catch (error) {
      console.error("Image upload error: ", error);
      return res.status(500).json({ error: "Error creating location" });
    }

    if (!blob) {
      return res.status(500).json({ error: "Error creating location" });
    }

    const { signingKey, verifyingKey } = await generateSignatureKeyPair();

    const location = await prisma.location.create({
      data: {
        chipId,
        name,
        description,
        sponsor,
        imageUrl: blob.url,
        signaturePublicKey: verifyingKey,
      },
    });

    await prisma.locationKey.create({
      data: {
        locationId: location.id,
        signaturePrivateKey: signingKey,
      },
    });

    return res.status(200).json({ locationId: location.id });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
