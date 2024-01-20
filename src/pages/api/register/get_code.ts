import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import { ErrorResponse } from "../tap";

export type EmptyResponse = {};

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

  // Delete all signin codes associated with the email
  await prisma.signinCode.deleteMany({
    where: { email: email },
  });

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
  const signinCode = signinCodeEntry.value;

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    const msg = {
      to: email,
      from: "andrewclu98@gmail.com",
      subject: "Your Signin Code",
      text: `Your one-time signin code is: ${signinCode}. It will expire in 30 minutes.`,
      html: `<strong>Your one-time signin code is: ${signinCode}</strong>. It will expire in 30 minutes.`,
    };

    await sgMail.send(msg);

    return res.status(200).json({});
  } catch (error) {
    console.error("Error sending email", error);
    return res.status(500).json({ error: "Error sending email" });
  }
}
