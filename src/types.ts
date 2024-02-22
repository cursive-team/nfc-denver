import { Item, Quest } from "@prisma/client";
import { MembershipProof } from "babyjubjub-ecdsa";

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
  sigNullifierRandomness: string;
  users: UserRequirementPreview[];
};

export type LocationRequirementPreview = {
  id: number;
  name: string;
  imageUrl: string;
  signaturePublicKey: string;
};

export type LocationRequirement = {
  name: string;
  numSigsRequired: number;
  sigNullifierRandomness: string;
  locations: LocationRequirementPreview[];
};

export type ItemPreview = {
  id: number;
  name: string;
  imageUrl: string;
  sponsor: string;
  description: string;
  buidlCost: number;
};

export type QuestWithRequirements = Quest & {
  userRequirements: UserRequirement[];
  locationRequirements: LocationRequirement[];
};

export type QuestWithCompletion = QuestWithRequirements & {
  isCompleted?: boolean;
};

export type QuestWithRequirementsAndItems = QuestWithRequirements & {
  requiredForItems: ItemPreview[];
};

export type QuestProof = {
  userProofs: MembershipProof[][];
  locationProofs: MembershipProof[][];
};

export type ItemWithRequirements = Item & {
  questRequirements: QuestWithRequirements[];
};

export type ItemWithCompletion = ItemWithRequirements & {
  isCompleted?: boolean;
};
