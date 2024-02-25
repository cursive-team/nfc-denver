import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { ErrorResponse } from "@/types";
import { isUserAdmin } from "@/lib/server/admin";

export type AdminUserInfo = {
  id: number;
  displayName: string;
  chipId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminUserInfo[] | ErrorResponse>
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

    const users: AdminUserInfo[] = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        chipId: true,
      },
    });

    res.status(200).json(users);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
