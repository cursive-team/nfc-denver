import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { EmptyResponse, ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmptyResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token, signaturePublicKey } = req.body;

  if (!token || !signaturePublicKey) {
    return res
      .status(400)
      .json({ error: "Missing token or signaturePublicKey" });
  }

  const isAdmin = isUserAdmin(token);
  if (!isAdmin) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const existingLocation = await prisma.location.findFirst({
    where: { signaturePublicKey },
  });
  if (existingLocation) {
    return res.status(400).json({ error: "Location already registered" });
  }

  const existingRegistration = await prisma.sigChipRegistration.findFirst({
    where: { signaturePublicKey },
  });
  if (existingRegistration) {
    return res.status(200).json({});
  }

  await prisma.sigChipRegistration.create({
    data: {
      signaturePublicKey,
    },
  });

  return res.status(200).json({});
}
