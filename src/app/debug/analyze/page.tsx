"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LogAnalyzer } from "@/components/debug/log-analyzer";

export default function AnalyzePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/debug" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">AI 日志分析</h1>
          <p className="text-sm text-muted-foreground">
            粘贴报错日志，AI 帮你诊断问题
          </p>
        </div>
      </div>

      <LogAnalyzer />
    </div>
  );
}
