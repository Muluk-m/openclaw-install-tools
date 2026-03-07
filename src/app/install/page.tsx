"use client";

import Link from "next/link";
import { Monitor, Apple, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useDetectedPlatform } from "@/components/install/os-detector";

const platforms = [
  {
    id: "windows" as const,
    href: "/install/windows",
    icon: Monitor,
    title: "Windows",
    description: "Windows 10/11，通过 npm 或 Git 安装",
  },
  {
    id: "mac" as const,
    href: "/install/mac",
    icon: Apple,
    title: "macOS",
    description: "通过 curl、npm 或 Git 安装",
  },
];

export default function InstallPage() {
  const detectedPlatform = useDetectedPlatform();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">安装 OpenClaw</h1>
        <p className="mt-2 text-muted-foreground">
          选择你的操作系统，跟随向导完成安装
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const isDetected = detectedPlatform === platform.id;
          return (
            <Link key={platform.id} href={platform.href} className="group">
              <Card
                className={`h-full transition-colors group-hover:border-primary/50 ${
                  isDetected ? "border-primary" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <platform.icon className="h-8 w-8" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{platform.title}</CardTitle>
                        {isDetected && (
                          <Badge variant="secondary">检测到</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {platform.description}
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href="/install/customize"
          className={buttonVariants({ variant: "link" })}
        >
          或者使用命令生成器定制安装命令 →
        </Link>
      </div>
    </div>
  );
}
