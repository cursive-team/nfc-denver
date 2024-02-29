import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import prisma from "@/lib/server/prisma";

export const getUserBuidlBalance = async (userId: number): Promise<number> => {
  const claveBalance = await getClaveBuidlBalance(userId);
  const localBalance = await getUserLocalBuidlBalance(userId);

  return claveBalance + localBalance;
};

// TODO: Implement this function
export const getClaveBuidlBalance = async (userId: number): Promise<number> => {
  return 0;
};

export const getUserLocalBuidlBalance = async (
  userId: number
): Promise<number> => {
  const unmintedQuestProofs = await prisma.questProof.findMany({
    where: { userId, minted: false },
    include: {
      quest: { select: { buidlReward: true } },
    },
  });
  const unmintedBuidl = unmintedQuestProofs.reduce(
    (sum, proof) => sum + proof.quest.buidlReward,
    0
  );

  return unmintedBuidl;
};

export const getClaveInviteLink = async (
  userEmail: string,
  userClaveInviteCode: string
) => {
  const jwt = signJwt(userEmail);

  return `https://getclave.io/link/summon?signature=${jwt}&waitlist=${userClaveInviteCode}`;
};

export function signJwt(email: string) {
  const now = dayjs();
  return jwt.sign(
    { iat: now.unix(), exp: now.add(5, "day").unix(), ethDenver: { email } },
    process.env.CLAVE_JWT_SECRET!,
    { algorithm: "HS256" }
  );
}

export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.CLAVE_JWT_SECRET!);
}

export const mintUserUnmintedBuidl = async (
  userId: number
): Promise<{ success: boolean; amount?: number }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return { success: false };
  }

  if (!user.claveWallet) {
    return { success: false };
  }

  const unmintedQuestProofs = await prisma.questProof.findMany({
    where: { userId, minted: false },
    include: {
      quest: { select: { buidlReward: true } },
    },
  });
  const unmintedBuidl = unmintedQuestProofs.reduce(
    (sum, proof) => sum + proof.quest.buidlReward,
    0
  );

  if (unmintedBuidl === 0) {
    return { success: true, amount: 0 };
  }

  const response = await fetch(
    `https://api.achievo.xyz/v1/contracts/FREE_BUIDL/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: process.env.SUMMON_API_KEY!,
      },
      body: JSON.stringify({
        playerAddress: user.claveWallet,
        functionName: "mint",
        erc: "20",
        args: {
          address: user.claveWallet,
          amount: unmintedBuidl,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Error minting buidl for user: ", userId);
    return { success: false };
  }

  await prisma.questProof.updateMany({
    where: { userId, minted: false },
    data: { minted: true },
  });

  await prisma.buidlMint.create({
    data: { userId, amount: unmintedBuidl },
  });

  return { success: true, amount: unmintedBuidl };
};
