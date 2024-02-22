import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextApiResponse, NextApiRequest } from "next";
import prisma from "@/lib/server/prisma";
import { getChipIdFromIykCmac } from "@/lib/server/dev";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { cmac } = request.query;

  if (typeof cmac !== "string") {
    return response.status(400).json({ error: "Invalid input parameters" });
  }

  const { chipId } = getChipIdFromIykCmac(cmac);
  if (!chipId) {
    return response.status(400).json({ error: "Invalid cmac" });
  }

  const existingLocation = await prisma.location.findUnique({
    where: {
      chipId,
    },
  });
  if (existingLocation) {
    return response.status(400).json({ error: "Location already registered" });
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
            chipId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("location image upload completed", tokenPayload);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    return response.status(400).json({ error: (error as Error).message });
  }
}
