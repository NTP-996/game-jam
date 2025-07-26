import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solana Game Jam: APAC",
  description:
    "Build the next big Web3 game in the official Solana Game Jam. Collaborate with top builders, get mentorship from industry experts, and showcase your project to the global Solana community.",
  keywords: [
    "Solana",
    "Game Jam",
    "APAC",
    "Blockchain",
    "Web3",
    "Gaming",
    "Hackathon",
  ],
  authors: [{ name: "Solana Game Jam APAC" }],
  openGraph: {
    title: "Solana Game Jam: APAC",
    description:
      "Build the next big Web3 game in the official Solana Game Jam. Collaborate with top builders, get mentorship from industry experts, and showcase your project to the global Solana community.",
    type: "website",
    url: "https://solana-game-jam-apac.com",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Solana Game Jam APAC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Game Jam: APAC",
    description:
      "Build the next big Web3 game in the official Solana Game Jam. Join builders across APAC to create the future of gaming on Solana.",
    images: ["/assets/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelifySans.variable} font-pixelify antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
