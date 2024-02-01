import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ErrorResponse } from "@/types";
import { Location } from "@prisma/client";
import {
  LocationSignature,
  getLocationSignature,
} from "@/lib/client/localStorage";
import { classed } from "@tw-classed/react";
import { Header } from "@/components/modals/QuestRequirementModal";
import useSettings from "@/hooks/useSettings";
import { AppBackHeader } from "@/components/AppHeader";
import toast from "react-hot-toast";

// TODO: Create shared component for this
const Label = classed.span("text-xs text-gray-10 font-light");
const Description = classed.span("text-gray-12 text-sm font-light");

const LocationDetails = () => {
  const { pageWidth } = useSettings();
  const router = useRouter();
  const { id } = router.query;
  const [location, setLocation] = useState<Location>();
  const [signature, setSignature] = useState<LocationSignature>();

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
  }, [router, id]);

  if (!location) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-8">
        {/* TODO: Create shared component for Header */}
        <Header title={location.name} label="Location" />
        <div className="flex flex-col gap-4">
          <div
            className="bg-slate-200 rounded"
            style={{
              width: `${pageWidth - 32}px`,
              height: `${pageWidth - 32}px`,
            }}
          >
            <img src={location.imageUrl} />
          </div>
          <div className="flex flex-col gap-4 jus">
            <div className="flex flex-col">
              <Label>Description</Label>
              <Description>{location.description}</Description>
            </div>
            {signature !== undefined && (
              <div className="flex flex-col">
                <Label>Visited On</Label>
                <Description>{`${signature.ts}`}</Description>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
