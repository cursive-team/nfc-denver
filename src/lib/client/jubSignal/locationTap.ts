import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type LocationTapMessage = {
  id: string; // locationId
  name: string; // Location name
  pk: string; // Signature public key
  msg: string; // Signature message
  sig: string; // Signature
};

export const locationTapMessageSchema = object({
  id: string().required(),
  name: string().required(),
  pk: string().required(),
  msg: string().required(),
  sig: string().required(),
});

export type EncryptLocationTapMessageArgs = {
  locationId: string;
  locationName: string;
  signaturePublicKey: string;
  signatureMessage: string;
  signature: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptLocationTapMessage({
  locationId,
  locationName,
  signaturePublicKey,
  signatureMessage,
  signature,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptLocationTapMessageArgs): Promise<string> {
  const messageData: LocationTapMessage = {
    id: locationId,
    name: locationName,
    pk: signaturePublicKey,
    msg: signatureMessage,
    sig: signature,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.LOCATION_TAP,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}
