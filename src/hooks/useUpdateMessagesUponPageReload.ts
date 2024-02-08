import { loadMessages } from "@/lib/client/jubSignalClient";
import { getAuthToken } from "@/lib/client/localStorage";
import { useEffect } from "react";

export const usePageReloadDetection = () => {
  useEffect(() => {
    const loadMessagesUponPageReload = async () => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        return;
      }

      const navigationEntries = window.performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0];
        if (navigationEntry.type && navigationEntry.type === "reload") {
          try {
            await loadMessages({ forceRefresh: false });
          } catch (error) {
            console.error("Failed to load messages upon page reload:", error);
          }
        }
      }
    };

    loadMessagesUponPageReload();
  }, []);
};
