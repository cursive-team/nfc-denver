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

  const numUserRequirementsSatisfied = userRequirements.filter(
    (requirement) =>
      computeNumRequirementSignatures({
        publicKeyList: userPublicKeys,
        userRequirement: requirement,
      }) >= requirement.numSigsRequired
  ).length;

  const numLocationRequirementsSatisfied = locationRequirements.filter(
    (requirement) =>
      computeNumRequirementSignatures({
        publicKeyList: locationPublicKeys,
        locationRequirement: requirement,
      }) >= requirement.numSigsRequired
  ).length;

  return numUserRequirementsSatisfied + numLocationRequirementsSatisfied;
};

// Given a list of public keys corresponding to signatures and a user or location requirement,
// return the number of signatures that satisfy the requirement
// Will return the minimum of the number of signatures possessed by the user and the number of
// signatures required by the requirement
export const computeNumRequirementSignatures = (args: {
  publicKeyList: string[];
  userRequirement?: UserRequirement;
  locationRequirement?: LocationRequirement;
}): number => {
  const { publicKeyList, userRequirement, locationRequirement } = args;

  if (userRequirement && locationRequirement) {
    throw new Error(
      "Cannot provide both a user and location requirement to computeNumRequirementSignatures"
    );
  }

  if (userRequirement) {
    return Math.min(
      userRequirement.numSigsRequired,
      userRequirement.users.filter((user) =>
        publicKeyList.includes(user.signaturePublicKey)
      ).length
    );
  } else if (locationRequirement) {
    return Math.min(
      locationRequirement.numSigsRequired,
      locationRequirement.locations.filter((location) =>
        publicKeyList.includes(location.signaturePublicKey)
      ).length
    );
  } else {
    throw new Error(
      "Must provide either a user or location requirement to computeNumRequirementSignatures"
    );
  }
};
