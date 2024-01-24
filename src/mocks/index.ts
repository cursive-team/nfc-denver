import { QuestRequirement } from "@/types";

export const questListMock: {
  id: number;
  title: string;
  description: string;
  reward?: number;
  requirements: { title: string; type: QuestRequirement }[];
}[] = [
  {
    id: 1,
    title: "Quest 1",
    description: "This is a quest description",
    reward: 100,
    requirements: [
      {
        title: "Location requirement",
        type: "LOCATION",
      },
      {
        title: "Person requirement",
        type: "PERSON",
      },
    ],
  },
  {
    id: 2,
    title: "Quest 2",
    description: "This is a quest description",
    requirements: [
      {
        title: "Location requirement",
        type: "LOCATION",
      },
      {
        title: "Person requirement",
        type: "PERSON",
      },
    ],
  },
  {
    id: 3,
    title: "Quest 3",
    description: "This is a quest description",
    requirements: [
      {
        title: "Location requirement",
        type: "LOCATION",
      },
      {
        title: "Person requirement",
        type: "PERSON",
      },
    ],
  },
];

export const personRequirements: {
  name: string;
  date: string;
  collected?: boolean;
}[] = [
  {
    name: "Ben",
    date: "Today 12:45am",
    collected: true,
  },
  {
    name: "Bobby",
    date: "Today 12:45am",
    collected: false,
  },
  {
    name: "Kali",
    date: "Today 12:45am",
    collected: true,
  },
];
