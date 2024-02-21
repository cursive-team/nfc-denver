import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ chipId: string } | ErrorResponse>
) {
  if (req.method === "GET") {
    let attempts = 0;
    while (attempts < 1000) {
      const randomId = Math.floor(Math.random() * 1000).toString();
      const existingUser = await prisma.user.findUnique({
        where: { chipId: randomId },
      });

      if (!existingUser) {
        return res.status(200).json({ chipId: randomId });
      }

      attempts++;
    }

    return res
      .status(500)
      .json({ error: "Unable to generate a unique chipId" });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
