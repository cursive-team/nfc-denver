import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { detectIncognito } from "detectincognitojs";

export default function useSettings() {
  const router = useRouter();
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isIncognito, setIsIncognito] = useState(false);

  const eventDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function checkIncognitoStatus() {
      const isIncognito = await detectIncognito();
      if (isIncognito.isPrivate) {
        setIsIncognito(true);
        return;
      }
    }

    checkIncognitoStatus();
  }, [router]);

  useEffect(() => {
    setPageWidth(window?.innerWidth);
    setPageHeight(window?.innerHeight);
  }, []);

  return { pageWidth, pageHeight, isIncognito, eventDate };
}
