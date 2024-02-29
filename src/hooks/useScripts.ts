import { loadScript } from "@/lib/shared/utils";
import { useState, useEffect } from "react";

const scripts: any[] = ["/bundle.js"];

export const useScripts = () => {
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all(scripts.map((script: string) => loadScript(script))).then(() =>
      setLoaded(true)
    );
  }, []);

  return isLoaded;
};
