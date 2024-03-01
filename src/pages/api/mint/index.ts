import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";
import { mintUserUnmintedBuidl } from "@/lib/server/clave";

export type BuidlMintResponseType = {
  success: boolean;
  amount?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BuidlMintResponseType | ErrorResponse>
) {
  if (req.method === "POST") {
    const { token, userEncKey } = req.body;

    // Validate the token
    if (typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    // Validate the id
    if (typeof userEncKey !== "string") {
      return res.status(400).json({ error: "ID must be a string" });
    }

    // Check if the user is an admin
    const isAdmin = await isUserAdmin(token);
    if (!isAdmin) {
      return res.status(403).json({ error: "You are not an admin" });
    }

    // Retrieve the quest proof to ensure it exists and has not been minted
    const user = await prisma.user.findFirst({
      where: { encryptionPublicKey: userEncKey },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const mintResult = await mintUserUnmintedBuidl(user.id);

    return res.status(200).json(mintResult);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
