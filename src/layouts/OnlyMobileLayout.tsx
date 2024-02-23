"use client";

import MobileDetect from "mobile-detect";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/cards/Card";
import { APP_CONFIG } from "@/shared/constants";
import { Icons } from "@/components/Icons";

interface OnlyMobileProps {
  children?: React.ReactNode;
}

const OnlyMobileBanner = () => {
  return (
    <div className="flex text-center h-screen">
      <div className="flex flex-col gap-8 my-auto mx-auto px-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 mx-auto">
            <Icons.iyk size={80} />
            <Icons.x size={12} />
            <Icons.cursive size={80} />
          </div>
          <span className="text-[36px] font-giorgio text-center">
            {APP_CONFIG.APP_NAME}
          </span>
        </div>

        <Card.Base className="p-2">
          <Card.Description>
            <span className=" text-sm">
              {`${APP_CONFIG.APP_NAME} is only available on mobile devices. Please visit the website on your phone in order to take part in the experience.`}
            </span>
          </Card.Description>
        </Card.Base>
      </div>
    </div>
  );
};

export default function OnlyMobileLayout({ children }: OnlyMobileProps) {
  const md = useRef<any>();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      md.current = new MobileDetect(window?.navigator?.userAgent);
      setIsMobile(md.current?.mobile() !== null);
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) return null;
  return <>{!isMobile ? <OnlyMobileBanner /> : children}</>;
}
