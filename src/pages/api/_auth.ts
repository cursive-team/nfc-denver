import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

/**
 * Generates an auth token and stores it in the database for a given userId.
 * @param userId The user ID for which to generate and store the auth token.
 * @returns The generated auth token.
 */
export const generateAuthToken = async (userId: number): Promise<string> => {
  const tokenValue = uuidv4();

  // Set default auth token expiry time to 2 weeks from now
  // 14 days, 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
  const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000;
  const twoWeeksFromNow = new Date(Date.now() + twoWeeksInMilliseconds);

  await prisma.authToken.create({
    data: {
      value: tokenValue,
      userId,
      expiresAt: twoWeeksFromNow,
    },
  });

  return tokenValue;
};
