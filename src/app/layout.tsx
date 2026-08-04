
import type { Metadata } from "next";
import StoreProvider from "@/shared/providers/store-provider";
import PwaRegister from "./components/pwa-register";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Sanime",
  description: "Crunchyroll-inspired anime browser for search and discovery.",
  themeColor: "#07101f",
  icons: {
    icon: "/icon/hqdefault.jpg",
    apple: "/icon/hqdefault.jpg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StoreProvider>
          {children}
          <PwaRegister />
        </StoreProvider>
      </body>
    </html>
  );
}
