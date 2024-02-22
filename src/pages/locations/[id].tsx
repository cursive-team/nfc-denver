import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import { ErrorResponse, QuestWithCompletion } from "@/types";
import { Location } from "@prisma/client";
import {
  LocationSignature,
  getLocationSignature,
} from "@/lib/client/localStorage";
import { AppBackHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { LocationDetailPlaceholder } from "@/components/placeholders/LocationDetailPlaceholder";
import Image from "next/image";
import { ListLayout } from "@/layouts/ListLayout";
import { useFetchQuests } from "@/hooks/useFetchQuests";
import { QuestCard } from "@/components/cards/QuestCard";
import { useQuestRequirements } from "@/hooks/useQuestRequirements";
import { Card } from "@/components/cards/Card";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { set } from "react-hook-form";

const LocationDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [location, setLocation] = useState<Location>();
  const [signature, setSignature] = useState<LocationSignature>();
  const [relatedQuests, setRelatedQuests] = useState<QuestWithCompletion[]>([]);

  const { isPending: isLoadingQuests, data = [] } = useFetchQuests();

  // TODO: get related quests should be replaced with a server call
  useEffect(() => {
    if (!location) return;
    const relatedQuests = data.filter((quest) => {
      const locationRequirements = quest.locationRequirements.filter(
        (requirement) =>
          requirement.locations.find((loc) => +loc.id === location.id)
      );

      return locationRequirements.length > 0;
    });

    setRelatedQuests(relatedQuests);
  }, [data, location]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (typeof id === "string") {
        try {
          const response = await fetch(`/api/location/${id}`);
          if (!response.ok) {
            const errorResponse: ErrorResponse = await response.json();
            console.error(errorResponse.error);
            toast.error("An error occurred. Please try again.");
            router.push("/");
          } else {
            const data: Location = await response.json();
            setLocation(data);
          }
        } catch (err) {
          toast.error("An error occurred. Please try again.");
          router.push("/");
        }

        const locationSignature = getLocationSignature(id);
        setSignature(locationSignature);
      }
    };

    fetchLocation();
  }, [router, id, isLoadingQuests]);

  const { numRequirementsSatisfied } = useQuestRequirements(relatedQuests);

  return (
    <div>
      <AppBackHeader redirectTo="/quests" />
      <LoadingWrapper
        isLoading={!location}
        fallback={<LocationDetailPlaceholder />}
        className="flex flex-col gap-6"
      >
        {location && (
          <>
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
                  <span className=" text-gray-12">{`${location.name}`}</span>
                  <span className=" text-gray-11">has been completed</span>
                </div>
                {location?.description?.length > 0 && (
                  <span className="text-gray-11 text-center">
                    {location.description}
                  </span>
                )}
              </div>
            </div>
            <ListLayout label="Continue quest">
              <LoadingWrapper
                className="flex flex-col gap-2"
                isLoading={isLoadingQuests}
                fallback={
                  <>
                    <Placeholder.List items={2} />
                  </>
                }
              >
                {relatedQuests?.map(
                  (
                    {
                      id,
                      name,
                      description,
                      userRequirements,
                      locationRequirements,
                      isCompleted = false,
                    },
                    index
                  ) => {
                    if (isCompleted) return null; // no need to show completed quests
                    return (
                      <QuestCard
                        key={id}
                        title={name}
                        description={description}
                        completedSigs={numRequirementsSatisfied[index]}
                        userRequirements={userRequirements}
                        locationRequirements={locationRequirements}
                        isCompleted={isCompleted}
                      />
                    );
                  }
                )}
              </LoadingWrapper>
            </ListLayout>
          </>
        )}
      </LoadingWrapper>
    </div>
  );
};

LocationDetails.getInitialProps = () => {
  return { fullPage: true };
};

export default LocationDetails;
