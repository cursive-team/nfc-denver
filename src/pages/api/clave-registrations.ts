import { UserAdminInfo } from "@/lib/server/admin";
import prisma from "@/lib/server/prisma";
import { EmptyResponse, ErrorResponse } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { ValidationError, object, string } from "yup";

const schema = object().shape({
  email: string().email("Must be a valid email").required("Email is required"),
  walletAddress: string().required("walletAddress is required"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAdminInfo | EmptyResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  if (req.headers["x-clave-admin-secret"] !== process.env.CLAVE_ADMIN_SECRET) {
    return res.status(403).json({ errors: ["Unauthorized"] });
  }

  try {
    const { email, walletAddress } = await schema.validate(req.body);

    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }

    await prisma.user.update({
      data: { claveWallet: walletAddress },
      where: { email },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ errors: ["Unknown error"] });
  }
}
