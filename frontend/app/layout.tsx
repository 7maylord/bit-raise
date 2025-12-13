"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StacksProvider } from "@/contexts/StacksContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>BitRaise - Decentralized Crowdfunding on Stacks</title>
        <meta name="description" content="Create and support crowdfunding campaigns on the Stacks blockchain with Bitcoin security" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StacksProvider>
          {children}
        </StacksProvider>
      </body>
    </html>
  );
}
