import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenClaw Install Tools",
    template: "%s | OpenClaw Install Tools",
  },
  description:
    "OpenClaw 安装辅助工具 - 交互式安装向导、局域网文件传输、问题诊断",
  openGraph: {
    title: "OpenClaw Install Tools",
    description:
      "帮你装好 OpenClaw - 交互式安装向导、局域网 P2P 文件传输、智能问题诊断",
    type: "website",
    siteName: "OpenClaw Install Tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClaw Install Tools",
    description:
      "帮你装好 OpenClaw - 交互式安装向导、局域网 P2P 文件传输、智能问题诊断",
  },
  keywords: ["OpenClaw", "安装", "AI 助手", "局域网传输", "WebRTC"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Navbar />
            <main className="container mx-auto max-w-5xl px-4 py-8">
              {children}
            </main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
