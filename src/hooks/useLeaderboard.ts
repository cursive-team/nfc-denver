import { useQuery } from "@tanstack/react-query";

export const useGetLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // TODO: replace with real API call

      const data = Array.from({ length: 100 }).map((_, index) => ({
        id: index,
        name: `User ${index}`,
        score: Math.floor(Math.random() * 1000),
        connections: Math.floor(Math.random() * 100),
        points: Math.floor(Math.random() * 100),
      }));

      return data;
    },
  });
};
