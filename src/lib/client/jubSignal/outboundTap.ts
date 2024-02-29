import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type OutboundTapMessage = {
  name: string; // Display name of other user
  pk: string; // Encryption public key of user
  note?: string; // Private note
};

export const outboundTapMessageSchema = object({
  name: string().required(),
  pk: string().required(),
  note: string().optional(),
});

export type EncryptOutboundTapMessageArgs = {
  displayName: string;
  encryptionPublicKey: string;
  privateNote?: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptOutboundTapMessage({
  displayName,
  encryptionPublicKey,
  privateNote,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptOutboundTapMessageArgs): Promise<string> {
  const messageData: OutboundTapMessage = {
    name: displayName,
    pk: encryptionPublicKey,
    note: privateNote,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}
