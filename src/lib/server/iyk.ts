import prisma from "@/lib/server/prisma";
import { boolean, object, string } from "yup";

export const iykRefResponseSchema = object({
  uid: string().optional().default(undefined),
  isValidRef: boolean().required(),
});

/**
 * Returns the chipId for a given iykRef, and if the iykRef is new or has been used
 */
export const getChipIdFromIykRef = async (
  iykRef: string,
  mockRef: boolean
): Promise<{ chipId: string | undefined; isValid: boolean }> => {
  if (mockRef && process.env.ALLOW_MOCK_REF === "true") {
    return getMockChipIdFromIykRef(iykRef);
  }

  const response = await fetch(`https://api.iyk.app/refs/${iykRef}`);
  if (!response.ok) {
    return { chipId: undefined, isValid: false };
  }
  const data = await response.json();
  try {
    const { uid, isValidRef } = iykRefResponseSchema.validateSync(data);
    return { chipId: uid, isValid: isValidRef };
  } catch (error) {
    return { chipId: undefined, isValid: false };
  }
};

export enum ChipType {
  PERSON = "PERSON",
  LOCATION = "LOCATION",
}

/**
 * Given a chipId, returns whether the chip is a person or location card
 * Returns undefined if the chipId is invalid
 */
export const getChipTypeFromChipId = async (
  chipId: string,
  mockRef: boolean
): Promise<ChipType | undefined> => {
  if (mockRef && process.env.ALLOW_MOCK_REF === "true") {
    return getMockChipTypeFromChipId(chipId);
  }

  const chip = await prisma.cmacChipRegistration.findFirst({
    where: {
      chipId,
    },
  });

  // If chip is not registered, assume it is a person chip
  if (!chip) {
    return ChipType.PERSON;
  }
  const { isLocationChip } = chip;

  return isLocationChip ? ChipType.LOCATION : ChipType.PERSON;
};

/**
 * Returns a mock chipId which is just equal to the iykRef
 */
export const getMockChipIdFromIykRef = (
  iykRef: string
): { chipId: string | undefined; isValid: boolean } => {
  const chipIdExists = getMockChipTypeFromChipId(iykRef) !== undefined;

  return { chipId: chipIdExists ? iykRef : undefined, isValid: true };
};

/**
 * Given a chipId, returns whether the chip is a person or location card
 * Returns undefined if the chipId is invalid
 * FOR MOCK CHIPS, PERSON CARDS HAVE CHIP IDS < 10000, LOCATION CARDS HAVE CHIP IDS >= 10000
 */
export const getMockChipTypeFromChipId = (
  chipId: string
): ChipType | undefined => {
  const parsedChipId = parseInt(chipId);
  if (isNaN(parsedChipId)) {
    return undefined;
  }

  if (parsedChipId < 0 || parsedChipId >= 20000) {
    return undefined;
  }

  return parsedChipId < 10000 ? ChipType.PERSON : ChipType.LOCATION;
};

/**
 * Given a chipId and email, check that the email is associated with the chipId
 * Returns boolean indicating match
 * Checks Tokenproof API for email
 */
export const verifyEmailForChipId = async (
  chipId: string,
  email: string
): Promise<boolean> => {
  try {
    const chipIdInt = parseInt(chipId);
    if (isNaN(chipIdInt)) {
      return false;
    }

    const hexChipId = chipIdInt.toString(16).padStart(14, "0");
    const response = await fetch(
      `https://ethdenver-api-pro.onrender.com/external/applications/tag/${hexChipId}`,
      {
        method: "GET",
        headers: {
          Authorization: process.env.TOKENPROOF_API_KEY!,
        },
      }
    );
    if (!response.ok) {
      return false;
    }

    const { address } = await response.json();
    if (!address) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(address);

    // Accept eth address based registrations
    if (!isEmail) {
      return true;
    }

    return address.toLowerCase() === email.toLowerCase();
  } catch (error) {
    console.error("Error verifying email for chipId", error);
    return false;
  }
};
