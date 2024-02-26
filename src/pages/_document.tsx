import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

const Metadata = {
  website: "buidlquest.xyz",
  title: "buidlquest.xyz",
  description: "Checkout our cool page",
  image: "/cursive.jpg",
};

export default function Document() {
  return (
    <Html lang="en">
      <Link type="image/png" href="/favicon.png" rel="icon" />
      <Link type="image/x-icon" href="/favicon.svg" rel="icon" />
      <Head>
        <title>{Metadata.website}</title>
        <meta name="description" content={Metadata.description} key="desc" />
        <meta property="og:title" content={Metadata.title} />
        <meta property="og:description" content={Metadata.description} />
        <meta property="og:image" content={Metadata.image} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
