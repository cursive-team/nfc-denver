import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth"; // hypothetical function for auth token verification
import { ErrorResponse } from "@/types";
import { getQuestById } from "@/lib/server/database";
import { verifyProofForQuest } from "@/lib/server/proving";

type SubmitQuestProofRequest = {
  questId: string;
  authToken: string;
  serializedProof: string;
};

type SubmitQuestProofResponse = {
  verified: boolean;
  proofId?: string;
};

export default async function submitProofHandler(
  req: NextApiRequest,
  res: NextApiResponse<SubmitQuestProofResponse | ErrorResponse>
) {
  if (req.method === "POST") {
    const { questId, authToken, serializedProof }: SubmitQuestProofRequest =
      req.body;

    if (
      typeof questId !== "string" ||
      typeof authToken !== "string" ||
      typeof serializedProof !== "string"
    ) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Verify the auth token
    const userId = await verifyAuthToken(authToken);
    if (!userId) {
      return res.status(400).json({ error: "Invalid or expired auth token" });
    }

    if (Number.isNaN(parseInt(questId))) {
      return res.status(400).json({ error: "Invalid quest ID" });
    }

    const quest = await getQuestById(parseInt(questId));
    if (!quest) {
      return res.status(404).json({ error: "Quest not found" });
    }

    const { verified } = await verifyProofForQuest(quest, serializedProof);
    if (!verified) {
      return res.status(200).json({ verified: false });
    }

    // Save the proof to the database
    const proof = await prisma.questProof.create({
      data: {
        questId: quest.id,
        userId: userId,
        serializedProof,
      },
    });

    res.status(200).json({ verified: true, proofId: proof.id });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
