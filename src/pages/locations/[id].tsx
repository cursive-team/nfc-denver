import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ErrorResponse } from "@/types";
import { Location } from "@prisma/client";
import {
  LocationSignature,
  getLocationSignature,
} from "@/lib/client/localStorage/locationSignatures";

const LocationDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [location, setLocation] = useState<Location>();
  const [locationSignature, setLocationSignature] =
    useState<LocationSignature>();

  useEffect(() => {
    const fetchLocation = async () => {
      if (typeof id === "string") {
        try {
          const response = await fetch(`/api/location/${id}`);
          if (!response.ok) {
            const errorResponse: ErrorResponse = await response.json();
            console.error(errorResponse.error);
            alert("An error occurred. Please try again.");
            router.push("/");
          } else {
            const data: Location = await response.json();
            setLocation(data);
          }
        } catch (err) {
          alert("An error occurred. Please try again.");
          router.push("/");
        }

        const locationSignature = getLocationSignature(id);
        setLocationSignature(locationSignature);
      }
    };

    fetchLocation();
  }, [router, id]);

  if (!location) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {location.name}
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Image
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-1">
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="w-full h-auto object-cover"
                />
              </dd>
              {locationSignature && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Signature
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-1">
                    {"You visited this location on: " +
                      locationSignature?.timestamp}
                  </dd>
                </div>
              )}
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-1">
                {location.description}
              </dd>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sponsor
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-1">
                {location.sponsor}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
