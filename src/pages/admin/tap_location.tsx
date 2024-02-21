import { Header } from "@/components/modals/QuestRequirementModal";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Icons } from "@/components/Icons";
import { Card } from "@/components/cards/Card";
import { AdminLocationInfo } from "../api/admin/locations";

const AdminTapLocationPage = () => {
  const router = useRouter();
  const [locations, setLocations] = useState<AdminLocationInfo[]>([]);

  const handleTapLocation = (chipId: string) => {
    router.push(`/tap?cmac=${chipId}`);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await fetch("/api/admin/locations");
      if (!response.ok) {
        console.error("Error fetching locations: ", response.statusText);
        return;
      }

      const locations = await response.json();
      setLocations(locations);
    };
    fetchLocations();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Mock Tapping a Location Card"
        label="Click on the location you want to tap"
      />
      <div className="flex flex-col gap-4">
        <div>
          {locations.map(({ id, name, chipId }, index) => {
            return (
              <div
                key={index}
                onClick={() => handleTapLocation(chipId)}
                className="flex justify-between border-b w-full border-gray-300  last-of-type:border-none first-of-type:pt-0 py-1"
              >
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
                    <Icons.home size={12} />
                  </div>
                  <Card.Title>{name}</Card.Title>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminTapLocationPage;
