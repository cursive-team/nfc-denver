import prisma from "@/lib/server/prisma";
import {
  JUB_SIGNAL_MESSAGE_TYPE,
  PsiMessageResponse,
} from "../client/jubSignal";

export async function findAndDeleteMostRecentPsiMessage(
  recipientEncKey: string
): Promise<PsiMessageResponse | undefined> {
  // Find the most recent message for the given userId
  const message = await prisma.psiMessage.findFirst({
    where: { recipientEncKey: recipientEncKey },
    orderBy: { createdAt: "desc" },
  });

  // If a message is found, delete it
  if (message) {
    await prisma.psiMessage.delete({ where: { id: message.id } });
  } else {
    return undefined;
  }

  return {
    data: message.data,
    senderEncKey: message.senderEncKey,
  };
}
