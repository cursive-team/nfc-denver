import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { object, string } from "yup";
import { encryptString } from "@/lib/backup";
import { verifyAuthToken } from "./_auth";
import { EmptyResponse, ErrorResponse } from "./_types";
import { backupSchema } from "@/util/localStorage";

export type EncryptedBackupData = {
  encryptedData: string;
  authenticationTag: string;
  iv: string;
};

export const encryptedBackupDataSchema = object({
  encryptedData: string().required(),
  authenticationTag: string().required(),
  iv: string().required(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmptyResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { backup, wantsServerCustody, authToken } = req.body;

  // Validate authToken
  const userId = await verifyAuthToken(authToken);
  if (userId === undefined) {
    return res.status(401).json({ error: "Invalid or expired auth token" });
  }

  // Retrieve user and check wantsServerCustody matches
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // For safety, check that wantsServerCustody matches
  if (user.wantsServerCustody !== wantsServerCustody) {
    return res.status(400).json({ error: "Mismatch in custody preference" });
  }

  // TODO: Clean up old backups while adding new ones

  if (wantsServerCustody) {
    // If wantsServerCustody, backup must be a string
    if (typeof backup !== "string") {
      return res.status(400).json({ error: "Invalid backup" });
    }

    try {
      const parsedBackup = JSON.parse(backup);
      const validatedBackup = backupSchema.validateSync(parsedBackup);
      if (!validatedBackup) {
        throw new Error("Invalid backup");
      }
    } catch (error) {
      return res.status(400).json({ error: "Invalid backup" });
    }
    const serverEncryptionEmail = process.env.SERVER_ENCRYPTION_EMAIL!;
    const serverEncryptionPassword = process.env.SERVER_ENCRYPTION_PASSWORD!;
    const { encryptedData, authenticationTag, iv } = encryptString(
      backup,
      serverEncryptionEmail,
      serverEncryptionPassword
    );

    await prisma.backup.create({
      data: {
        userId: user.id,
        encryptedData,
        authenticationTag,
        iv,
        isServerEncrypted: true,
      },
    });
  } else {
    // If !wantsServerCustody, backup must be an object with encryptedData, authenticationTag, and iv
    try {
      const backupData = encryptedBackupDataSchema.validateSync(backup);
      if (!backupData) {
        throw new Error("Invalid backup");
      }

      const { encryptedData, authenticationTag, iv } = backupData;
      await prisma.backup.create({
        data: {
          userId: user.id,
          encryptedData,
          authenticationTag,
          iv,
          isServerEncrypted: false,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: "Invalid backup" });
    }
  }

  return res.status(200).json({});
}
