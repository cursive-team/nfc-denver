import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <title>BUIDLQuest</title>
      <Head>
        <meta
          name="description"
          content="Connect with ETHDenver attendees, engage with sponsors, and unlock unique experiences by tapping NFC chips."
          key="desc"
        />
        <meta property="og:title" content="BUIDLQuest" />
        <meta
          property="og:description"
          content="Connect with ETHDenver attendees, engage with sponsors, and unlock unique experiences by tapping NFC chips."
        />
        <meta property="og:image" content="/cursive.jpg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script defer src="/bundle.js"></Script>
      </body>
    </Html>
  );
}
