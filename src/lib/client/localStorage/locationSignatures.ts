import { LocationTapResponse } from "@/pages/api/tap";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const LOCATION_SIGNATURES_STORAGE_KEY = "locationSignatures";

export type LocationSignature = {
  id: string; // locationId
  pk: string; // Location signature public key
  msg: string; // Message that is signed
  sig: string; // Signature
  ts: Date; // Timestamp
};

export const saveLocationSignatures = (
  signatures: Record<string, LocationSignature>
): void => {
  saveToLocalStorage(
    LOCATION_SIGNATURES_STORAGE_KEY,
    JSON.stringify(signatures)
  );
};

export const getLocationSignatures = (): Record<string, LocationSignature> => {
  const signatures = getFromLocalStorage(LOCATION_SIGNATURES_STORAGE_KEY);
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
    id: locationUpdate.id,
    pk: locationUpdate.signaturePublicKey,
    msg: locationUpdate.signatureMessage,
    sig: locationUpdate.signature,
    ts: new Date(),
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

export const deleteAllLocationSignatures = (): void => {
  deleteFromLocalStorage(LOCATION_SIGNATURES_STORAGE_KEY);
};
