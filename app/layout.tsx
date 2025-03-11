import RootProviders from "@/components/providers/RootProviders";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance tracker assessment by uday",
  description: "Finance tracker assessment by uday",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <ClerkProvider>
    <html
      lang="en"
      className="dark"
      style={{
        colorScheme: "dark",
      }}
    >
      <body className={inter.className}>
        <Toaster richColors position="bottom-right" />
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
    // </ClerkProvider>
  );
}
