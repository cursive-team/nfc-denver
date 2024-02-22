import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { object, string } from "yup";
import { ErrorResponse } from "@/types";
import {
  ChipType,
  getChipIdFromIykCmac,
  getChipTypeFromChipId,
} from "@/lib/server/dev";
import { sign } from "@/lib/shared/signature";
import { getCounterMessage } from "babyjubjub-ecdsa";
const crypto = require("crypto");

export enum TapResponseCode {
  CMAC_INVALID = "CMAC_INVALID",
  PERSON_NOT_REGISTERED = "PERSON_NOT_REGISTERED",
  LOCATION_NOT_REGISTERED = "LOCATION_NOT_REGISTERED",
  VALID_PERSON = "VALID_PERSON",
  VALID_LOCATION = "VALID_LOCATION",
}

export type PersonTapResponse = {
  id: string;
  displayName: string;
  encryptionPublicKey: string;
  fhePublicKeyShare: string;
  relinKeyPublicRound1: string;
};

export const personTapResponseSchema = object({
  id: string().required(),
  displayName: string().required(),
  encryptionPublicKey: string().required(),
  fhePublicKeyShare: string().required(),
  relinKeyPublicRound1: string().required(),
});

export type LocationTapResponse = {
  id: string;
  name: string;
  description: string;
  sponsor: string;
  imageUrl: string;
  signaturePublicKey: string;
  signatureMessage: string;
  signature: string;
};

export const locationTapResponseSchema = object({
  id: string().required(),
  name: string().required(),
  description: string().required(),
  sponsor: string().required(),
  imageUrl: string().required(),
  signaturePublicKey: string().required(),
  signatureMessage: string().required(),
  signature: string().required(),
});

export type TapResponse = {
  code: TapResponseCode;
  person?: PersonTapResponse;
  location?: LocationTapResponse;
};

export const tapResponseSchema = object({
  code: string().oneOf(Object.values(TapResponseCode)),
  person: personTapResponseSchema.optional().default(undefined),
  location: locationTapResponseSchema.optional().default(undefined),
});

/**
 * Returns a signature for a given location
 * Mirrors Arx card signature generation
 * First 4 bytes of message are an incrementing counter
 * Remaining 28 bytes are random
 * @param locationId The id of the location for which to generate a signature
 */
export const generateLocationSignature = async (
  locationId: number
): Promise<{ message: string; signature: string }> => {
  const locationKey = await prisma.locationKey.findUnique({
    where: {
      locationId,
    },
  });
  if (!locationKey) {
    throw new Error("Location key not found");
  }

  const { signaturePrivateKey, numPreviousTaps } = locationKey;
  const msgNonce = numPreviousTaps + 1; // Incrementing counter
  const randomBytes = crypto.randomBytes(28); // 28 random bytes
  const message = getCounterMessage(msgNonce, randomBytes.toString("hex"));
  const signature = sign(signaturePrivateKey, message);

  await prisma.locationKey.update({
    where: {
      locationId,
    },
    data: {
      numPreviousTaps: numPreviousTaps + 1,
    },
  });

  return { message, signature };
};

/**
 * GET
 * Receives an iyk chip cmac
 * Responds with person tap data, location tap data, or an error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TapResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // cmac must be provided
  const cmac = req.query.cmac;
  if (!cmac || typeof cmac !== "string") {
    return res.status(400).json({ error: "Invalid code provided" });
  }

  const { chipId, isValid } = getChipIdFromIykCmac(cmac);
  // cmac must exist in iyk's lookup
  if (chipId === undefined) {
    return res.status(400).json({ error: "Invalid code provided" });
  }
  // cmac must not have been used before
  if (!isValid) {
    return res.status(200).json({ code: TapResponseCode.CMAC_INVALID });
  }

  // if user is registered, return user data
  const user = await prisma.user.findUnique({
    where: {
      chipId,
    },
  });
  if (user) {
    const personTapResponse: PersonTapResponse = {
      id: user.id.toString(),
      displayName: user.displayName,
      encryptionPublicKey: user.encryptionPublicKey,
      fhePublicKeyShare: user.fhePublicKeyShare,
      relinKeyPublicRound1: user.relinKeyPublicRound1,
    };
    return res
      .status(200)
      .json({ code: TapResponseCode.VALID_PERSON, person: personTapResponse });
  }

  // if location is registered, return location data
  const location = await prisma.location.findUnique({
    where: {
      chipId,
    },
  });
  if (location) {
    const { message, signature } = await generateLocationSignature(location.id);
    const locationTapResponse: LocationTapResponse = {
      id: location.id.toString(),
      name: location.name,
      description: location.description,
      sponsor: location.sponsor,
      imageUrl: location.imageUrl,
      signaturePublicKey: location.signaturePublicKey,
      signatureMessage: message,
      signature,
    };
    return res.status(200).json({
      code: TapResponseCode.VALID_LOCATION,
      location: locationTapResponse,
    });
  }

  // card is not registered, return whether it is a person card or location card
  const chipType = getChipTypeFromChipId(chipId);
  if (chipType === ChipType.PERSON) {
    return res
      .status(200)
      .json({ code: TapResponseCode.PERSON_NOT_REGISTERED });
  } else if (chipType === ChipType.LOCATION) {
    return res
      .status(200)
      .json({ code: TapResponseCode.LOCATION_NOT_REGISTERED });
  } else {
    return res.status(200).json({ code: TapResponseCode.CMAC_INVALID });
  }
}
