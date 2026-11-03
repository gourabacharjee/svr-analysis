import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SVR Analysis — Trading | Research | Analysis",
  description:
    "Real-time authentic Indian stock market news, NSE & BSE updates, SEBI rules and guidelines, pre-market technical pivots, and trading current affairs. 100% free for retail traders.",
  icons: {
    icon: "./logo.png",
    shortcut: "./logo.png",
    apple: "./logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./logo.png" />
        <link rel="apple-touch-icon" href="./logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
