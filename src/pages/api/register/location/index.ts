import { NextApiRequest, NextApiResponse } from "next";
import { head } from "@vercel/blob";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { generateSignatureKeyPair } from "@/lib/shared/signature";
import {
  ChipType,
  getChipIdFromIykRef,
  getChipTypeFromChipId,
} from "@/lib/server/iyk";

export type LocationRegistrationResponse = {
  locationId: Number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationRegistrationResponse | ErrorResponse>
) {
  if (req.method === "POST") {
    const {
      iykRef,
      mockRef,
      name,
      description,
      sponsor,
      imageUrl,
      emailWallet,
    } = req.body;

    if (
      typeof iykRef !== "string" ||
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof sponsor !== "string" ||
      typeof imageUrl !== "string"
    ) {
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    const enableMockRef = mockRef === "true";
    const { chipId } = await getChipIdFromIykRef(iykRef, enableMockRef);
    if (!chipId) {
      return res.status(400).json({ error: "Invalid iykRef" });
    }

    const chipType = await getChipTypeFromChipId(chipId, enableMockRef);
    if (chipType !== ChipType.LOCATION) {
      return res
        .status(400)
        .json({ error: "iykRef does not correspond to location chip" });
    }

    // Check that location is not already registered
    const existingLocation = await prisma.location.findUnique({
      where: {
        chipId,
      },
    });
    if (existingLocation) {
      return res.status(400).json({ error: "Location already registered" });
    }

    // Check that user uploaded location image to vercel blob
    try {
      await head(imageUrl);
    } catch (error) {
      return res.status(400).json({ error: "Invalid image url" });
    }

    // Generate signing keypair for the location
    const { signingKey, verifyingKey } = generateSignatureKeyPair();

    const location = await prisma.location.create({
      data: {
        chipId,
        name,
        description,
        sponsor,
        imageUrl,
        signaturePublicKey: verifyingKey,
        displayEmailWalletLink: emailWallet,
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
