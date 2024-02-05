import { AuthToken } from "@/lib/client/localStorage";
import { useQuery } from "@tanstack/react-query";
import { array, boolean, number, object, string } from "yup";

export type LeaderboardData = {
  name: string;
  connections: number;
  isCurrentUser?: boolean;
}[];

export const leaderboardDataSchema = array().of(
  object().shape({
    name: string().required("Name is required"),
    connections: number()
      .required("Connections count is required")
      .min(0, "Connections cannot be negative"),
    isCurrentUser: boolean().optional().default(false),
  })
);

export const useGetLeaderboard = (authToken: AuthToken | undefined) => {
  return useQuery({
    queryKey: ["leaderboard", authToken],
    queryFn: async (): Promise<LeaderboardData> => {
      if (!authToken || authToken.expiresAt < new Date()) {
        return [];
      }

      const response = await fetch(`/api/leaderboard?token=${authToken.value}`);
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      try {
        const leaderboard = leaderboardDataSchema.validateSync(data);
        if (!leaderboard) {
          throw new Error("Invalid leaderboard data");
        }

        return leaderboard;
      } catch (error) {
        console.error("Failed to validate leaderboard data:", error);
        return [];
      }
    },
  });
};
