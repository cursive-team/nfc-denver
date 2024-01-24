import { LocationTapResponse } from "@/pages/api/tap";
import { getFromLocalStorage, saveToLocalStorage } from ".";

export type LocationSignature = {
  locationId: string;
  signaturePublicKey: string;
  signature: string;
  timestamp: Date;
};

export const saveLocationSignatures = (
  signatures: Record<string, LocationSignature>
): void => {
  saveToLocalStorage("locationSignatures", JSON.stringify(signatures));
};

export const getLocationSignatures = (): Record<string, LocationSignature> => {
  const signatures = getFromLocalStorage("locationSignatures");
  if (signatures) {
    return JSON.parse(signatures);
  }

  return {};
};

// Populate location information based on a tap
export const updateLocationSignatureFromTap = async (
  locationUpdate: LocationTapResponse
): Promise<string> => {
  const signatures = getLocationSignatures();

  const newLocationSignature = {
    locationId: locationUpdate.id,
    signaturePublicKey: locationUpdate.signaturePublicKey,
    signature: locationUpdate.signature,
    timestamp: new Date(),
  };

  signatures[locationUpdate.id] = newLocationSignature;
  saveLocationSignatures(signatures);

  return locationUpdate.id;
};

export const getLocationSignature = (
  locationId: string
): LocationSignature | undefined => {
  const signatures = getLocationSignatures();

  return signatures[locationId];
};
