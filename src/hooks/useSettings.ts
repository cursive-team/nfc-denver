import { useEffect, useState } from "react";

export default function useSettings() {
  const [pageWidth, setPageHeight] = useState(0);

  useEffect(() => {
    setPageHeight(window?.innerWidth);
  }, []);

  return { pageWidth };
}
