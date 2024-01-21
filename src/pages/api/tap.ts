import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { object, string } from "yup";
import { ErrorResponse } from "./_types";
import {
  ChipType,
  TODO_getChipIdFromIykCmac,
  TODO_getChipTypeFromChipId,
} from "./_iyk";

export enum TapResponseCode {
  CMAC_INVALID = "CMAC_INVALID",
  PERSON_NOT_REGISTERED = "PERSON_NOT_REGISTERED",
  LOCATION_NOT_REGISTERED = "LOCATION_NOT_REGISTERED",
  VALID_PERSON = "VALID_PERSON",
  VALID_LOCATION = "VALID_LOCATION",
}

export type PersonTapResponse = {
  displayName: string;
  encryptionPublicKey: string;
  twitterUsername?: string;
  telegramUsername?: string;
};

export const personTapResponseSchema = object({
  displayName: string().required(),
  encryptionPublicKey: string().required(),
  twitterUsername: string().optional(),
  telegramUsername: string().optional(),
});

export type LocationTapResponse = {
  name: string;
  description: string;
  sponsor: string;
  imageUrl: string;
  signaturePublicKey: string;
  signature: string;
};

export const locationTapResponseSchema = object({
  name: string().required(),
  description: string().required(),
  sponsor: string().required(),
  imageUrl: string().required(),
  signaturePublicKey: string().required(),
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
 */
export const TODO_generateLocationSignature = async (
  locationId: number
): Promise<string> => {
  return "example_signature";
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
    return res.status(200).json({ code: TapResponseCode.CMAC_INVALID });
  }

  const { chipId, isValid } = TODO_getChipIdFromIykCmac(cmac);
  // cmac must exist in iyk's lookup
  if (chipId === undefined) {
    return res.status(200).json({ code: TapResponseCode.CMAC_INVALID });
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
      displayName: user.displayName,
      encryptionPublicKey: user.encryptionPublicKey,
      twitterUsername: user.twitterUsername ?? undefined,
      telegramUsername: user.telegramUsername ?? undefined,
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
    const signature = await TODO_generateLocationSignature(location.id);
    const locationTapResponse: LocationTapResponse = {
      name: location.name,
      description: location.description,
      sponsor: location.sponsor,
      imageUrl: location.imageUrl,
      signaturePublicKey: location.signaturePublicKey,
      signature,
    };
    return res.status(200).json({
      code: TapResponseCode.VALID_LOCATION,
      location: locationTapResponse,
    });
  }

  // card is not registered, return whether it is a person card or location card
  const chipType = TODO_getChipTypeFromChipId(chipId);
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
