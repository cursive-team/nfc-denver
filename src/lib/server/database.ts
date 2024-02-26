import prisma from "@/lib/server/prisma";
import { QuestWithRequirementsAndItem } from "@/types";

export const getQuestById = async (
  id: number
): Promise<QuestWithRequirementsAndItem | null> => {
  return await prisma.quest.findUnique({
    where: { id },
    include: {
      userRequirements: {
        select: {
          id: true,
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
          id: true,
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
      item: {
        select: {
          id: true,
          name: true,
          sponsor: true,
          description: true,
          imageUrl: true,
          buidlCost: true,
          isSoldOut: true,
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
    questId: true,
    isSoldOut: true,
    createdAt: true,
    quest: {
      select: {
        id: true,
        name: true,
        description: true,
        sponsor: true,
        imageUrl: true,
        summonId: true,
        buidlReward: true,
        itemId: true,
        createdAt: true,
        userRequirements: {
          select: {
            id: true,
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
            id: true,
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
