import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const ITEM_REDEEMED_STORAGE_KEY = "itemRedeemed";

export type ItemRedeemed = {
  id: string; // Item id
  name: string; // Item name
  qrId: string; // Id of qr code for item redemption
  ts: string; // Timestamp as ISO string
};

export const saveAllItemRedeemed = (
  itemRedeemed: Record<string, ItemRedeemed>
): void => {
  saveToLocalStorage(ITEM_REDEEMED_STORAGE_KEY, JSON.stringify(itemRedeemed));
};

export const getAllItemRedeemed = (): Record<string, ItemRedeemed> => {
  const itemRedeemed = getFromLocalStorage(ITEM_REDEEMED_STORAGE_KEY);
  if (itemRedeemed) {
    return JSON.parse(itemRedeemed);
  }

  return {};
};

export const saveItemRedeemed = (itemRedeemed: ItemRedeemed): void => {
  const allItemRedeemed = getAllItemRedeemed();
  allItemRedeemed[itemRedeemed.id] = itemRedeemed;

  saveAllItemRedeemed(allItemRedeemed);
};

export const getItemRedeemed = (itemId: string): ItemRedeemed | undefined => {
  const allItemRedeemed = getAllItemRedeemed();

  return allItemRedeemed[itemId];
};

export const deleteAllItemRedeemed = (): void => {
  deleteFromLocalStorage(ITEM_REDEEMED_STORAGE_KEY);
};
