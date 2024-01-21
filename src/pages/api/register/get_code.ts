import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { EmptyResponse, ErrorResponse } from "../_types";
import { generateAndSendSigninCode } from "../_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmptyResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // TODO: Do we need to check if chip matches email?

  // Check if email is already registered
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    // TODO: Propagate this error to the client
    console.error("Email already registered");
    return res.status(400).json({ error: "Email already registered" });
  }

  const sentSigninCode = await generateAndSendSigninCode(email);
  if (sentSigninCode) {
    return res.status(200).json({});
  } else {
    return res.status(500).json({ error: "Error sending email" });
  }
}
