import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dliy io - Open-Source Workflow Automation",
  description: "A powerful, flexible, self-hostable alternative to Zapier. Build AI-powered automations visually with hundreds of integrations.",
  keywords: ["workflow", "automation", "Zapier alternative", "open source", "AI agents", "low-code", "self-hosted"],
  authors: [{ name: "Death Legion Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "dliy io - Open-Source Workflow Automation",
    description: "Build AI-powered automations visually with hundreds of integrations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "dliy io",
    description: "Open-source workflow automation by Death Legion Team",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
