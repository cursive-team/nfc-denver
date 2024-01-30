import React, { useEffect, useState } from "react";
import { Modal, ModalProps } from "./Modal";
import {
  LocationRequirementPreview,
  QuestRequirementType,
  UserRequirementPreview,
} from "@/types";
import { Icons } from "../Icons";
import { classed } from "@tw-classed/react";
import useSettings from "@/hooks/useSettings";
import { Card } from "../cards/Card";
import {
  LocationSignature,
  getLocationSignature,
} from "@/lib/client/localStorage/locationSignatures";
import { getUsers } from "@/lib/client/localStorage";
import { hashPublicKeyToUUID } from "@/lib/client/utils";

const Label = classed.span("text-xs text-gray-10 font-light");
const Description = classed.span("text-gray-12 text-sm font-light");
const Title = classed.span("text-gray-12 text-lg font-light");

type HeaderProps = {
  label?: string;
  title?: string;
  completed?: boolean;
};

export const Header = ({ title, label, completed }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col ">
        {label && <Label>{label}</Label>}
        <Title>{title}</Title>
      </div>
      {completed && <Icons.checkedCircle />}
    </div>
  );
};

type LocationDetailProps = HeaderProps & {
  locations: LocationRequirementPreview[];
};

const LocationDetail = ({
  title,
  completed,
  locations,
}: LocationDetailProps) => {
  const { pageWidth } = useSettings();
  const [location, setLocation] = useState<LocationRequirementPreview>();
  const [signature, setSignature] = useState<LocationSignature>();

  useEffect(() => {
    if (locations.length === 0) return;
    setLocation(locations[0]);
    setSignature(getLocationSignature(locations[0].id.toString()));
  }, [locations]);

  if (!location) return null;

  return (
    <div className="flex flex-col gap-8">
      <Header title={title} label="Requirement" completed={completed} />
      <div className="flex flex-col gap-4">
        <div
          className="bg-slate-200 rounded bg-cover bg-center bg-no-repeat"
          style={{
            width: `${pageWidth - 32}px`,
            height: `${pageWidth - 32}px`,
            backgroundImage: `url(${location.imageUrl})`,
          }}
        ></div>
        <div className="flex flex-col gap-4 jus">
          <div className="flex flex-col">
            <Label>Location</Label>
            <Description>{location.name}</Description>
          </div>
          {signature !== undefined && (
            <div className="flex flex-col">
              <Label>Visited On</Label>
              <Description>{`${signature.timestamp}`}</Description>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type UserDetailProps = HeaderProps & {
  users: UserRequirementPreview[];
};

const UserDetail = ({ title, completed, users }: UserDetailProps) => {
  const [userSigsCollected, setUserSigsCollected] = useState<number[]>([]);

  useEffect(() => {
    const getCollectedSigs = async () => {
      if (users.length === 0) return;

      const userSigs = getUsers();
      const sigsIndices: number[] = [];
      const sigChecks = users.map(async (user, index) => {
        const userId = await hashPublicKeyToUUID(user.encryptionPublicKey);
        if (userSigs[userId]) {
          sigsIndices.push(index);
        }
      });

      await Promise.all(sigChecks);
      setUserSigsCollected(sigsIndices);
    };

    getCollectedSigs();
  }, [users]);

  if (users.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      <Header title={title} label="Requirement" completed={completed} />
      <div className="flex flex-col gap-4">
        <Label>{`X/${users.length} Collected`}</Label>
        <div>
          {users.map(({ displayName }, index) => {
            const collected = userSigsCollected.includes(index);
            return (
              <div
                key={index}
                className="flex justify-between border-b w-full border-gray-300  last-of-type:border-none first-of-type:pt-0 py-1"
              >
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
                    <Icons.person size={12} />
                  </div>
                  <Card.Title>{displayName}</Card.Title>
                </div>
                {collected && <Icons.checkedCircle />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface QuestRequirementModalProps extends ModalProps {
  requirementName: string;
  questRequirementType: QuestRequirementType;
  users?: UserRequirementPreview[];
  locations?: LocationRequirementPreview[];
}

const QuestRequirementModal = ({
  requirementName,
  questRequirementType,
  users,
  locations,
  isOpen,
  setIsOpen,
}: QuestRequirementModalProps) => {
  const completed = false;

  const showUsers = questRequirementType === QuestRequirementType.USER && users;
  const showLocations =
    questRequirementType === QuestRequirementType.LOCATION && locations;

  if (!showUsers && !showLocations) return null;

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex flex-col min-h-[60vh]">
        {showUsers && (
          <UserDetail
            users={users}
            title={requirementName}
            completed={completed}
          />
        )}
        {showLocations && (
          <LocationDetail
            locations={locations}
            title={requirementName}
            completed={completed}
          />
        )}
      </div>
    </Modal>
  );
};

QuestRequirementModal.displayName = "QuestRequirementModal";
export { QuestRequirementModal };
