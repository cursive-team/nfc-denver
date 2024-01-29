import { Quest } from "@prisma/client";

export type EmptyResponse = {};

export type ErrorResponse = { error: string };

export type LabelProps = {
  label: string;
  content: string;
};

export interface QuestItem extends Quest {}

export enum QuestRequirementType {
  USER = "USER",
  LOCATION = "LOCATION",
}

export type UserRequirementPreview = {
  displayName: string;
  encryptionPublicKey: string;
  signaturePublicKey: string;
};

export type UserRequirement = {
  name: string;
  numSigsRequired: number;
  users: UserRequirementPreview[];
};

export type LocationRequirementPreview = {
  id: number;
  name: string;
  imageUrl: string;
};

export type LocationRequirement = {
  name: string;
  numSigsRequired: number;
  locations: LocationRequirementPreview[];
};

export type QuestWithRequirements = Quest & {
  userRequirements: UserRequirement[];
  locationRequirements: LocationRequirement[];
};
