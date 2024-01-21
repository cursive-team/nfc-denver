import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const showFooter = pageProps?.showFooter ?? true;
  const showHeader = pageProps?.showHeader ?? true;
  const fullPage = pageProps?.fullPage ?? false;
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col grow">
        {showHeader && !fullPage && <AppHeader />}
        <div className="flex flex-col grow container px-4 ">
          <Component {...pageProps} />
        </div>
        {showFooter && !fullPage && <AppFooter />}
      </div>
    </div>
  );
}
