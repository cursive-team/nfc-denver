import React, { ReactNode } from "react";
import { Modal, ModalProps } from "./Modal";
import { QuestRequirementType } from "@/types";
import { Icons } from "../Icons";
import { classed } from "@tw-classed/react";
import useSettings from "@/hooks/useSettings";
import { Card } from "../cards/Card";
import { personRequirements } from "@/mocks";

const Label = classed.span("text-xs text-gray-10 font-light");
const Description = classed.span("text-gray-12 text-sm font-light");
const Title = classed.span("text-gray-12 text-lg font-light");

type HeaderProps = {
  label?: string;
  title?: string;
  completed?: boolean;
};

interface DetailProps extends HeaderProps {}

const Header = ({ title, label, completed }: HeaderProps) => {
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

const LocationDetail = ({ title, completed }: DetailProps) => {
  const { pageWidth } = useSettings();
  return (
    <div className="flex flex-col gap-8">
      <Header title={title} label="Requirement" completed={completed} />
      <div className="flex flex-col gap-4">
        <div
          className="bg-slate-200 rounded"
          style={{
            width: `${pageWidth - 32}px`,
            height: `${pageWidth - 32}px`,
          }}
        />
        <div className="grid grid-cols-2 gap-4 jus">
          <div className="flex flex-col">
            <Label>Venue</Label>
            <Description>Location name</Description>
          </div>
          <div className="flex flex-col">
            <Label>Location</Label>
            <Description>Location name</Description>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonDetail = ({ title, completed }: DetailProps) => {
  return (
    <div className="flex flex-col gap-8">
      <Header title={title} label="Requirement" completed={completed} />
      <div className="flex flex-col gap-4">
        <Label>{`X/X Collected`}</Label>
        <div>
          {personRequirements?.map(({ name, collected }, index) => {
            return (
              <div
                key={index}
                className="flex justify-between border-b w-full border-gray-300  last-of-type:border-none first-of-type:pt-0 py-1"
              >
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full"></div>
                  <Card.Title>{name}</Card.Title>
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
  questName: string;
  questRequirementType: QuestRequirementType;
}

const QuestRequirementMapping: Record<
  QuestRequirementType,
  (props: HeaderProps) => ReactNode
> = {
  LOCATION: LocationDetail,
  USER: PersonDetail,
};

const QuestRequirementModal = ({
  isOpen,
  setIsOpen,
  questName,
  questRequirementType,
}: QuestRequirementModalProps) => {
  const Component = QuestRequirementMapping[questRequirementType];
  const completed = false;

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex flex-col">
        <Component title={questName} completed={completed} />
      </div>
    </Modal>
  );
};

QuestRequirementModal.displayName = "QuestRequirementModal";
export { QuestRequirementModal };
