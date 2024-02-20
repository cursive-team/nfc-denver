// THIS IS A DEVELOPMENT FILE
// DO NOT USE THIS IN PRODUCTION

/**
 * Returns the chipId for a given cmac, and if the cmac is new or has been used
 */
export const getChipIdFromIykCmac = (
  cmac: string
): { chipId: string | undefined; isValid: boolean } => {
  const chipId = parseInt(cmac);
  if (isNaN(chipId)) {
    return { chipId: undefined, isValid: false };
  }

  // TEMPORARY: CHIPS ARE ONLY VALID WITH IDS FROM 0-99
  const chipIdExists = chipId >= 0 && chipId < 100;
  return { chipId: chipIdExists ? cmac : undefined, isValid: true };
};

export enum ChipType {
  PERSON = "PERSON",
  LOCATION = "LOCATION",
}

/**
 * Given a chipId, returns whether the chip is a person or location card
 * Returns undefined if the chipId is invalid
 * TEMPORARY: PERSON CARDS HAVE CHIP IDS < 50, LOCATION CARDS HAVE CHIP IDS >= 50
 */
export const getChipTypeFromChipId = (chipId: string): ChipType | undefined => {
  const parsedChipId = parseInt(chipId);
  if (isNaN(parsedChipId)) {
    return undefined;
  }

  if (parsedChipId < 0 || parsedChipId >= 100) {
    return undefined;
  }

  return parsedChipId < 50 ? ChipType.PERSON : ChipType.LOCATION;
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
