import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import OnlyMobileLayout from "@/layouts/OnlyMobileLayout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [pageHeight, setPageHeight] = useState(0);
  const showFooter = pageProps?.showFooter ?? true;
  const showHeader = pageProps?.showHeader ?? true;
  const fullPage = pageProps?.fullPage ?? false;

  useEffect(() => {
    setPageHeight(window?.innerHeight);
  }, []);

  return (
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
  );
}
