import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon placeholder – replace public/favicon.ico with your own */}
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#0A0E1A" />
        <meta property="og:title"       content="RaffleChain – On-Chain BNB Lottery" />
        <meta property="og:description" content="The fairest crypto lottery on BNB Smart Chain. Transparent, instant payouts, verified on-chain." />
        <meta property="og:type"        content="website" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content="RaffleChain – Win BNB Every 24h" />
        <meta name="twitter:description" content="Buy a ticket for 0.01 BNB. 95% goes to the winner. Fully on-chain, zero trust required." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
