import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { usePageReloadDetection } from "@/hooks/useUpdateMessagesUponPageReload";
import OnlyMobileLayout from "@/layouts/OnlyMobileLayout";
import "@/styles/globals.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(`Something went wrong: ${error.message}`),
  }),
});

export default function App({ Component, pageProps }: AppProps) {
  const [pageHeight, setPageHeight] = useState(0);
  const showFooter = pageProps?.showFooter ?? true;
  const showHeader = pageProps?.showHeader ?? true;
  const fullPage = pageProps?.fullPage ?? false;

  useEffect(() => {
    setPageHeight(window?.innerHeight);
  }, []);

  usePageReloadDetection();

  return (
    <QueryClientProvider client={queryClient}>
      <OnlyMobileLayout>
        <div
          className="flex flex-col overflow-scroll"
          style={{
            height: `${pageHeight}px`,
          }}
        >
          <div className="flex flex-col grow">
            {showHeader && !fullPage && <AppHeader />}
            <div className="flex flex-col grow container px-4">
              <Component {...pageProps} />
            </div>
            {showFooter && !fullPage && <AppFooter />}
          </div>
        </div>
      </OnlyMobileLayout>
      <Toaster
        toastOptions={{
          duration: 5000,
        }}
      />
    </QueryClientProvider>
  );
}
