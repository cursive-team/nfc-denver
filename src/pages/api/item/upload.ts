import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextApiResponse, NextApiRequest } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";
import { isUserAdmin } from "@/lib/server/dev";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { token } = request.query;

  if (typeof token !== "string") {
    return response.status(400).json({ error: "Invalid input parameters" });
  }

  const userId = await verifyAuthToken(token);
  if (!userId) {
    return response.status(401).json({ error: "Invalid or expired token" });
  }

  if (!isUserAdmin(userId)) {
    return response.status(403).json({ error: "Unauthorized" });
  }

  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
          tokenPayload: JSON.stringify({
            userId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("item image upload completed", tokenPayload);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    return response.status(400).json({ error: (error as Error).message });
  }
}
