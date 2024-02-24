import Image from "next/image";
import { Modal, ModalProps } from "./Modal";
import { LocationWithQuests } from "@/types";
import { ListLayout } from "@/layouts/ListLayout";
import { LoadingWrapper } from "../wrappers/LoadingWrapper";
import { Placeholder } from "../placeholders/Placeholder";
import { QuestCard } from "../cards/QuestCard";
import { getNonceFromCounterMessage } from "@/lib/client/libhalo";
import { useFetchQuests } from "@/hooks/useFetchQuests";
import { useQuestRequirements } from "@/hooks/useQuestRequirements";
import Link from "next/link";

interface LocationTapModalProps extends ModalProps {
  location: LocationWithQuests;
  signatureMessage: string | undefined;
}

const LocationTapModal = ({
  location,
  signatureMessage,
  isOpen,
  setIsOpen,
}: LocationTapModalProps) => {
  const { isPending: isLoadingQuests, data: quests = [] } = useFetchQuests();
  const { numRequirementsSatisfied } = useQuestRequirements(quests);
  const locationQuestRequirementIds = location.questRequirements.map(
    (quest) => quest.id
  );
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex flex-col min-h-[60vh]">
        <div className="flex flex-col items-center gap-[10px] pt-24 pb-28">
          <div className="flex bg-[#677363] justify-center items-center h-10 w-10 rounded-full ">
            <Image
              src="/icons/home.png"
              height={16}
              width={16}
              alt="home image"
            />
          </div>
          <div className="flex flex-col gap-[10px] items-center mx-6">
            <span className=" text-xl tracking-[-0.2px] font-light text-gray-12">
              Success!
            </span>
            <div className="flex gap-0.5 text-xs font-light">
              <span className=" text-gray-11">You have visited</span>
              <span className=" text-gray-12">{`${location.name}`}</span>
            </div>
            {signatureMessage &&
              getNonceFromCounterMessage(signatureMessage) && (
                <div className="flex gap-0.5 text-xs font-light">
                  <span className=" text-gray-11">You are visitor no.</span>
                  <span className=" text-gray-12">{`${getNonceFromCounterMessage(
                    signatureMessage
                  )}`}</span>
                </div>
              )}
            {location.description.length > 0 && (
              <span className="text-gray-11 text-center">
                {location.description}
              </span>
            )}
          </div>
        </div>
        {locationQuestRequirementIds.length !== 0 && (
          <ListLayout label="Quests involving this location">
            <LoadingWrapper
              className="flex flex-col gap-2"
              isLoading={isLoadingQuests}
              noResultsLabel=""
              fallback={
                <>
                  <Placeholder.List items={2} />
                </>
              }
            >
              {locationQuestRequirementIds.map((id) => {
                const questIndex = quests.findIndex((quest) => quest.id === id);
                if (questIndex === -1) {
                  return null;
                }
                const quest = quests[questIndex];
                const questNumRequirementsSatisfied =
                  numRequirementsSatisfied[questIndex];

                const {
                  name,
                  description,
                  userRequirements,
                  locationRequirements,
                  isCompleted = false,
                } = quest;
                return (
                  <Link href={`/quests/${id}`} key={id}>
                    <QuestCard
                      key={id}
                      title={name}
                      description={description}
                      completedSigs={questNumRequirementsSatisfied}
                      userRequirements={userRequirements}
                      locationRequirements={locationRequirements}
                      isCompleted={isCompleted}
                    />
                  </Link>
                );
              })}
            </LoadingWrapper>
          </ListLayout>
        )}
      </div>
    </Modal>
  );
};

LocationTapModal.displayName = "LocationTapModal";
export { LocationTapModal };
