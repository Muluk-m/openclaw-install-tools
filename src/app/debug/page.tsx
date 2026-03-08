"use client";

import { LogAnalyzer } from "@/components/debug/log-analyzer";

export default function DebugPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">AI 问题诊断</h1>
        <p className="mt-2 text-muted-foreground">
          粘贴报错日志，AI 帮你分析问题并给出修复建议
        </p>
      </div>

      <LogAnalyzer />
    </div>
  );
}
