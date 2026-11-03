import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SVR Analysis — Free Indian Stock Market Intelligence, SEBI Rules & Trading Hub",
  description:
    "SVR Analysis is a 100% free stock market platform providing real-time news updates on Indian stocks, NSE, BSE, SEBI rules and guidelines, F&O ban lists, FII/DII activity, pre-market levels, and trading current affairs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
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
