import prisma from "@/lib/server/prisma";
import { QuestWithRequirementsAndItems } from "@/types";

export const getQuestById = async (
  id: number
): Promise<QuestWithRequirementsAndItems | null> => {
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
      requiredForItems: {
        select: {
          id: true,
          name: true,
          sponsor: true,
          description: true,
          imageUrl: true,
          buidlCost: true,
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
