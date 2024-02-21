import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type ItemRedeemedMessage = {
  id: string; // Item id
  name: string; // Item name
  qrId: string; // Id of qr code for item redemption
};

export const itemRedeemedMessageSchema = object({
  id: string().required(),
  name: string().required(),
  qrId: string().required(),
});

export type EncryptItemRedeemedMessageArgs = {
  itemId: string;
  itemName: string;
  qrCodeId: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptItemRedeemedMessage({
  itemId,
  itemName,
  qrCodeId,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptItemRedeemedMessageArgs): Promise<string> {
  const messageData: ItemRedeemedMessage = {
    id: itemId,
    name: itemName,
    qrId: qrCodeId,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.ITEM_REDEEMED,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}
