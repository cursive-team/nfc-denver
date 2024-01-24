import { AppBackHeader, AppHeader } from "@/components/AppHeader";
import { ProfileImage } from "@/components/ProfileImage";
import { classed } from "@tw-classed/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Label = classed.span("text-gray-10 text-xs font-light");
const Description = classed.span("text-center text-gray-12 text-sm font-light");

export default function ContactSnapshotPage() {
  const [pageWidth, setPageHeight] = useState(0);

  const params = useParams();
  const userId = params?.id;

  const isLoggedUser = Number(userId) === 2;

  useEffect(() => {
    setPageHeight(window?.innerWidth);
  }, []);

  const cardSize = pageWidth - 32;

  return (
    <div className="flex flex-col h-screen">
      <AppBackHeader />
      <div className="flex flex-col gap-10 my-auto">
        <div className="flex flex-col gap-4">
          <ProfileImage
            style={{
              width: `${cardSize}px`,
              height: `${cardSize}px`,
            }}
          />
          <div className="flex flex-col">
            {!isLoggedUser && (
              <Description>Snapshot at the time you met [XXX]</Description>
            )}
            <Label className="text-center ">Jan [XX], 11:10</Label>
          </div>
        </div>
        {isLoggedUser && (
          <label className="flex flex-col gap-4 w-full">
            <div className="label p-0">
              <Label className="label-text">What is your name?</Label>
              <Label className="label-text-alt">Top Right label</Label>
            </div>
            <input
              type="range"
              name=""
              min={1}
              max={10}
              className="w-full h-0.5 bg-gray-700 accent-gray-12 appearance-none"
            />
          </label>
        )}
      </div>
    </div>
  );
}

ContactSnapshotPage.getInitialProps = () => {
  return { fullPage: true };
};
