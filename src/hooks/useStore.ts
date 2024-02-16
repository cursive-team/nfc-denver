import { getAllItemRedeemed, getAuthToken } from "@/lib/client/localStorage";
import { ItemWithCompletion, ItemWithRequirements } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export const useFetchStore = () => {
  const router = useRouter();

  const itemRedeemed = getAllItemRedeemed();
  const redeemedItemIds: string[] = Object.keys(itemRedeemed);

  return useQuery({
    queryKey: ["store"],
    queryFn: async (): Promise<ItemWithCompletion[]> => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        toast.error("You must be logged in to connect");
        router.push("/login");
        return [];
      }

      const response = await fetch(`/api/item?token=${authToken.value}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const items = await response.json();
      return items.map((item: ItemWithRequirements) => {
        const isCompleted = redeemedItemIds?.includes(item.id.toString());

        return {
          ...item,
          isCompleted,
        };
      });
    },
  });
};

export const useRedeemStoreItem = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: ["redeemStoreItem"],
    mutationFn: async (itemId: number): Promise<string> => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        toast.error("You must be logged in to connect");
        router.push("/login");
        return "";
      }

      const response = await fetch(`/api/item/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, token: authToken.value }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { qrCodeId } = await response.json();
      return qrCodeId;
    },
  });
};
