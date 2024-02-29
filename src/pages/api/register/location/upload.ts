import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextApiResponse, NextApiRequest } from "next";
import prisma from "@/lib/server/prisma";
import {
  ChipType,
  getChipIdFromIykRef,
  getChipTypeFromChipId,
} from "@/lib/server/iyk";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { iykRef, mockRef, sigPk } = request.query;

  if (iykRef && typeof iykRef === "string") {
    const enableMockRef =
      process.env.ALLOW_MOCK_REF === "true" && mockRef === "true";
    const { chipId } = await getChipIdFromIykRef(iykRef, enableMockRef);
    if (!chipId) {
      return response.status(400).json({ error: "Invalid iykRef" });
    }

    const chipType = await getChipTypeFromChipId(chipId, enableMockRef);
    if (chipType !== ChipType.LOCATION) {
      return response
        .status(400)
        .json({ error: "iykRef does not correspond to location chip" });
    }

    const existingLocation = await prisma.location.findUnique({
      where: {
        chipId,
      },
    });
    if (existingLocation) {
      return response
        .status(400)
        .json({ error: "Location already registered" });
    }
  } else if (sigPk && typeof sigPk === "string") {
    const existingLocation = await prisma.location.findUnique({
      where: {
        chipId: sigPk,
      },
    });
    if (existingLocation) {
      return response
        .status(400)
        .json({ error: "Location already registered" });
    }
  } else {
    return response.status(400).json({ error: "Invalid input parameters" });
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
            iykRef,
            mockRef,
            sigPk,
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
