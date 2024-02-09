import { useEffect, useState } from "react";

export default function useSettings() {
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    setPageWidth(window?.innerWidth);
    setPageHeight(window?.innerHeight);
  }, []);

  return { pageWidth, pageHeight };
}
