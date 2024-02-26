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
 * TEMPORARY: ALWAYS RETURNS TRUE
 */
export const verifyEmailForChipId = (
  chipId: string,
  email: string
): boolean => {
  return true;
};
