import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

const Metadata = {
  website: "buidlquest.xyz",
  title: "buidlquest.xyz",
  description:
    "Connect with ETHDenver attendees, engage with sponsors, and unlock unique experiences by tapping NFC chips.",
  image: "/cursive.jpg",
};

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>{Metadata.website}</title>
        <meta name="description" content={Metadata.description} key="desc" />
        <meta property="og:title" content={Metadata.title} />
        <meta property="og:description" content={Metadata.description} />
        <meta property="og:image" content={Metadata.image} />
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
      </body>
    </Html>
  );
}
