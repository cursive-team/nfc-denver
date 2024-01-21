import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "../_types";
import { VerifySigninCodeResponse, verifySigninCode } from "../_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifySigninCodeResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const verifySigninCodeResult = await verifySigninCode(email, code, false);
  res.status(200).json(verifySigninCodeResult);
}
