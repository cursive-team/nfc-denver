import { useMutation, useQuery } from "@tanstack/react-query";

export const useFetchStore = () => {
  return useQuery({
    queryKey: ["store"],
    queryFn: async () => {
      // TODO: replace with actual API call
      return Array.from({ length: 10 }).map((_, i) => ({
        id: i * 10, // makes picsum image better
        partner: `Partner ${i + 1}`,
        itemName: `Item ${i + 1}`,
        points: i * 100,
        unlocked: i % 2 === 0, // TODO: to implement
        redeemed: i % 3 === 0, // TODO: to implement
      }));
    },
  });
};

export const useRedeemStoreItem = () => {
  return useMutation({
    mutationKey: ["redeemStoreItem"],
    mutationFn: async (itemId: number) => {
      // TODO: replace with actual API call
    },
  });
};
