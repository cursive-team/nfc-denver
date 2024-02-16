import prisma from "@/lib/server/prisma";
import { QuestWithRequirements } from "@/types";

export const getQuestById = async (
  id: number
): Promise<QuestWithRequirements | null> => {
  return await prisma.quest.findUnique({
    where: { id },
    include: {
      userRequirements: {
        select: {
          name: true,
          numSigsRequired: true,
          sigNullifierRandomness: true,
          users: {
            select: {
              displayName: true,
              encryptionPublicKey: true,
              signaturePublicKey: true,
            },
          },
        },
      },
      locationRequirements: {
        select: {
          name: true,
          numSigsRequired: true,
          sigNullifierRandomness: true,
          locations: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              signaturePublicKey: true,
            },
          },
        },
      },
    },
  });
};

export const itemWithRequirementsSelector = {
  select: {
    id: true,
    name: true,
    sponsor: true,
    description: true,
    imageUrl: true,
    buidlCost: true,
    questRequirementIds: true,
    createdAt: true,
    questRequirements: {
      include: {
        userRequirements: {
          select: {
            name: true,
            numSigsRequired: true,
            sigNullifierRandomness: true,
            users: {
              select: {
                displayName: true,
                encryptionPublicKey: true,
                signaturePublicKey: true,
              },
            },
          },
        },
        locationRequirements: {
          select: {
            name: true,
            numSigsRequired: true,
            sigNullifierRandomness: true,
            locations: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                signaturePublicKey: true,
              },
            },
          },
        },
      },
    },
  },
};
