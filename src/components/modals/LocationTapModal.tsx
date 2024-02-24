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
import { Button } from "../Button";
import { LocationSignature, getAuthToken } from "@/lib/client/localStorage";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { useState } from "react";
import { Spinner } from "../Spinner";

enum MintDisplayState {
  DISPLAY,
  LOADING,
  SUCCESS,
}

interface LocationTapModalProps extends ModalProps {
  location: LocationWithQuests;
  signature: LocationSignature | undefined;
}

const LocationTapModal = ({
  location,
  signature,
  isOpen,
  setIsOpen,
}: LocationTapModalProps) => {
  const router = useRouter();
  const { isPending: isLoadingQuests, data: quests = [] } = useFetchQuests();
  const { numRequirementsSatisfied } = useQuestRequirements(quests);
  const locationQuestRequirementIds = location.questRequirements.map(
    (quest) => quest.id
  );
  const [mintDisplayState, setMintDisplayState] = useState<MintDisplayState>(
    MintDisplayState.DISPLAY
  );

  const handleEmailMint = async () => {
    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to mint an NFT.");
      router.push("/login");
      return;
    }

    if (!signature) {
      toast.error("You must have a signature to mint an NFT.");
      return;
    }

    setMintDisplayState(MintDisplayState.LOADING);

    const response = await fetch("/api/location/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: authToken.value,
        locationId: location.id,
        signature: signature.sig,
        message: signature.msg,
      }),
    });

    if (response.ok) {
      toast.success(
        "Mint successful! Check your email in a few seconds for a special NFT."
      );
      setMintDisplayState(MintDisplayState.SUCCESS);
    } else {
      toast.error("Error minting NFT. Please try again later.");
      setMintDisplayState(MintDisplayState.DISPLAY);
    }
  };

  const getMintDisplayState = () => {
    if (mintDisplayState === MintDisplayState.DISPLAY) {
      return (
        <Button onClick={handleEmailMint} className="w-24 h-8 mt-4">
          Mint an NFT to your email
        </Button>
      );
    } else if (mintDisplayState === MintDisplayState.LOADING) {
      return <Spinner label="Minting your NFT..." />;
    } else {
      return (
        <div className="text-gray-11">Check your email for a special NFT!</div>
      );
    }
  };

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
            {signature?.msg && getNonceFromCounterMessage(signature.msg) && (
              <div className="flex gap-0.5 text-xs font-light">
                <span className=" text-gray-11">You are visitor no.</span>
                <span className=" text-gray-12">{`${getNonceFromCounterMessage(
                  signature.msg
                )}`}</span>
              </div>
            )}
            {location.displayEmailWalletLink &&
              signature &&
              getMintDisplayState()}
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
