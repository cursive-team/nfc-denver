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
    return response.status(400).json({ error: "cmac is required" });
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
      onBeforeGenerateToken: async (
        pathname: string
        /* clientPayload?: string, */
      ) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
          tokenPayload: JSON.stringify({
            chipId, // Pass the chipId as part of the token payload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log("blob upload completed", tokenPayload);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    // The webhook will retry 5 times waiting for a 200
    return response.status(400).json({ error: (error as Error).message });
  }
}
