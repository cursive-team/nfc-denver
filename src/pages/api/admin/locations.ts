import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";

export type AdminLocationInfo = {
  id: number;
  name: string;
  chipId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminLocationInfo[] | ErrorResponse>
) {
  if (req.method === "GET") {
    const { token } = req.query;

    if (typeof token !== "string") {
      return res.status(400).json({ error: "Invalid input parameters" });
    }

    const isAdmin = await isUserAdmin(token);
    if (!isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const locations: AdminLocationInfo[] = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        chipId: true,
      },
    });

    res.status(200).json(locations);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
