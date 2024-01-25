import { Quest } from "@prisma/client";

export type EmptyResponse = {};

export type ErrorResponse = { error: string };

export enum QuestRequirementType {
  USER = "USER",
  LOCATION = "LOCATION",
}

export type QuestWithRequirements = Quest & {
  userRequirements: {
    name: string;
    numSigsRequired: number;
    users: {
      displayName: string;
    }[];
  }[];
  locationRequirements: {
    name: string;
    numSigsRequired: number;
    locations: {
      name: string;
    }[];
  }[];
};
