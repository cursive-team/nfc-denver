import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

import { object, string } from "yup";

export type RegisterResponse = {
  signinCode: string;
};

export const registerResponseSchema = object({
  signinCode: string().required(),
});

export type ErrorResponse = { error: string };

export const errorResponseSchema = object({
  error: string().required(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate a one-time signin code as a 6 digit integer represented as a string, with leading zeros if necessary
  const newSigninCode = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  // Set the expiration time to 30 minutes from the current time
  // 30 minutes * 60 seconds per minute * 1000 milliseconds per second
  const expiresAt = new Date(new Date().getTime() + 30 * 60 * 1000);

  // Save the signin code and expiration time associated with the email in the database
  const signinCodeEntry = await prisma.signinCode.create({
    data: { value: newSigninCode, email, expiresAt, usedGuessAttempts: 0 },
  });

  return res.status(200).json({ signinCode: signinCodeEntry.value });
}
