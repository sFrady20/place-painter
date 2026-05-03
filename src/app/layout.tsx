import { GoogleAnalytics } from "@/components/google-analytics";
import "@/styles/main.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const displayFont = Geist({
  variable: "--font-display",
  subsets: ["latin"],
});
const bodyFont = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});
const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Place Painter",
  description: "Paint the places you'd live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${[displayFont, bodyFont, monoFont]
        .map((x) => x.variable)
        .join(" ")}`}
    >
      <body className={`antialiased`}>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
