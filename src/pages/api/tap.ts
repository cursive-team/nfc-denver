import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export enum ErrorTapResponse {
  CMAC_INVALID,
  PERSON_NOT_REGISTERED,
  LOCATION_NOT_REGISTERED,
}

export type PersonTapResponse = {
  displayName: string;
  encryptionPubKey: string;
  twitterUsername?: string;
  telegramUsername?: string;
};

export type LocationTapResponse = {
  name: string;
  description: string;
  sponsor: string;
  imageUrl: string;
  signaturePubKey: string;
  signature: string;
};

export type TapResponse =
  | ErrorTapResponse
  | PersonTapResponse
  | LocationTapResponse;

export type ErrorResponse = { message: string };

/**
 * Returns the chipId for a given cmac, and if the cmac is new or has been used
 */
export const TODO_getChipIdFromIykCmac = (
  cmac: string
): { chipId: string; isValid: boolean } | undefined => {
  return { chipId: cmac, isValid: true };
};

/**
 * Returns a signature for a given location
 */
export const TODO_generateLocationSignature = async (
  locationId: number
): Promise<string> => {
  return "example_signature";
};

/**
 * Returns true if the chipId is a person card
 * TEMPORARY: PERSON CARDS HAVE CHIP IDS < 50, LOCATION CARDS HAVE CHIP IDS >= 50
 */
export const TODO_isChipIdAPersonCard = (chipId: string): boolean => {
  const parsedChipId = parseInt(chipId);
  return parsedChipId < 50;
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
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // cmac must be provided
  const cmac = req.body.cmac;
  if (!cmac) {
    return res.status(200).json(ErrorTapResponse.CMAC_INVALID);
  }

  // cmac must exist in iyk's lookup
  const cmacRes = TODO_getChipIdFromIykCmac(cmac);
  if (!cmacRes) {
    return res.status(200).json(ErrorTapResponse.CMAC_INVALID);
  }

  // cmac must not have been used before
  const { chipId, isValid } = cmacRes;
  if (!isValid) {
    return res.status(200).json(ErrorTapResponse.CMAC_INVALID);
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
      encryptionPubKey: user.encryptionPubKey,
      twitterUsername: user.twitterUsername ?? undefined,
      telegramUsername: user.telegramUsername ?? undefined,
    };
    return res.status(200).json(personTapResponse);
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
      signaturePubKey: location.signaturePubKey,
      signature,
    };
    return res.status(200).json(locationTapResponse);
  }

  // card is not registered, return whether it is a person card or location card
  const isPersonCard = TODO_isChipIdAPersonCard(chipId);
  if (isPersonCard) {
    return res.status(200).json(ErrorTapResponse.PERSON_NOT_REGISTERED);
  } else {
    return res.status(200).json(ErrorTapResponse.LOCATION_NOT_REGISTERED);
  }
}
