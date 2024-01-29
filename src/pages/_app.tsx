import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import OnlyMobileLayout from "@/layouts/OnlyMobileLayout";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { on } from "events";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {},
});

export default function App({ Component, pageProps }: AppProps) {
  const [pageHeight, setPageHeight] = useState(0);
  const showFooter = pageProps?.showFooter ?? true;
  const showHeader = pageProps?.showHeader ?? true;
  const fullPage = pageProps?.fullPage ?? false;

  useEffect(() => {
    setPageHeight(window?.innerHeight);
  }, []);

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
            <div className="flex flex-col grow container px-4 pb-24">
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
