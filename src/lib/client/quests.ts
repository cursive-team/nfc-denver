import { LocationRequirement, UserRequirement } from "@/types";

export const computeNumRequirementsSatisfied = (args: {
  userPublicKeys: string[]; // List of signature public keys for users who have sent signatures
  locationPublicKeys: string[]; // List of signature public keys for visited locations
  userRequirements: UserRequirement[];
  locationRequirements: LocationRequirement[];
}): number => {
  const {
    userPublicKeys,
    locationPublicKeys,
    userRequirements,
    locationRequirements,
  } = args;

  const numUserRequirementsSatisfied = userRequirements.filter((requirement) =>
    isUserRequirementSatisfied({ userPublicKeys, userRequirement: requirement })
  ).length;

  const numLocationRequirementsSatisfied = locationRequirements.filter(
    (requirement) =>
      isLocationRequirementSatisfied({
        locationPublicKeys,
        locationRequirement: requirement,
      })
  ).length;

  return numUserRequirementsSatisfied + numLocationRequirementsSatisfied;
};

export const isUserRequirementSatisfied = (args: {
  userPublicKeys: string[];
  userRequirement: UserRequirement;
}): boolean => {
  const { userPublicKeys, userRequirement } = args;
  const satisfiedSignatures = userRequirement.users.filter((user) =>
    userPublicKeys.includes(user.signaturePublicKey)
  ).length;

  return satisfiedSignatures >= userRequirement.numSigsRequired;
};

export const isLocationRequirementSatisfied = (args: {
  locationPublicKeys: string[];
  locationRequirement: LocationRequirement;
}): boolean => {
  const { locationPublicKeys, locationRequirement } = args;
  const satisfiedSignatures = locationRequirement.locations.filter((location) =>
    locationPublicKeys.includes(location.signaturePublicKey)
  ).length;

  return satisfiedSignatures >= locationRequirement.numSigsRequired;
};
