import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import RootProviders from "@/components/providers/RootProviders";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FINCARE",
  description: "Fincare, gelir ve giderlerinizi akıllıca yönetmenizi sağlayan yenilikçi ve güvenilir finansal asistanınızdır.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/logos/logo-dark.png",
        media: "(prefers-color-scheme: dark)"
      },
      {
        url: "/logos/logo-light.png",
        media: "(prefers-color-scheme: light)"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Toaster richColors position="bottom-right" />
          <RootProviders>
            <main>
              {children}
            </main>
          </RootProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
