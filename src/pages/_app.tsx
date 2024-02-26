import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { TransitionWrapper } from "@/components/Transition";
import OnlyMobileLayout from "@/layouts/OnlyMobileLayout";
import "@/styles/globals.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { StateMachineProvider } from "little-state-machine";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(`Something went wrong: ${error.message}`),
  }),
});

export default function App({ Component, pageProps }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pageHeight, setPageHeight] = useState(0);
  const showFooter = pageProps?.showFooter ?? true;
  const showHeader = pageProps?.showHeader ?? true;
  const fullPage = pageProps?.fullPage ?? false;

  useEffect(() => {
    setPageHeight(window?.innerHeight);
  }, []);

  return (
    <StateMachineProvider>
      <QueryClientProvider client={queryClient}>
        <OnlyMobileLayout>
          <div
            className="flex flex-col overflow-scroll"
            style={{
              height: `${pageHeight}px`,
            }}
          >
            <div className="flex flex-col grow">
              {showHeader && !fullPage && (
                <AppHeader
                  isMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                />
              )}
              <div className="flex flex-col grow container">
                <Component {...pageProps} />
              </div>
              <TransitionWrapper.Fade show={!isMenuOpen}>
                <>{showFooter && !fullPage && <AppFooter />}</>
              </TransitionWrapper.Fade>
            </div>
          </div>
        </OnlyMobileLayout>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
          }}
        />
      </QueryClientProvider>
    </StateMachineProvider>
  );
}
