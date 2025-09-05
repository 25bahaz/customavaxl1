import type { Metadata } from "next";
import "./globals.css";
import BackgroundDesign from "@/components/BackgroundDesign";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "takwallet-ui",
  description: "AUTHOR: @25bahaz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <BackgroundDesign />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
