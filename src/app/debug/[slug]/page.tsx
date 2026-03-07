"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { issueDetails } from "@/lib/error-patterns";
import { CommandBlock } from "@/components/install/command-block";

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const issue = issueDetails[slug];

  if (!issue) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">问题未找到</p>
        <Link href="/debug" className={buttonVariants({ variant: "outline" })}>
          返回诊断首页
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/debug" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">{issue.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">问题原因</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{issue.cause}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Windows 修复</CardTitle>
              <Badge variant="secondary">Windows</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {issue.windowsFix.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {issue.commands
              ?.filter((c) => c.platform === "windows" || c.platform === "all")
              .map((cmd, i) => (
                <CommandBlock
                  key={i}
                  command={cmd.command}
                  lang="powershell"
                />
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">macOS 修复</CardTitle>
              <Badge variant="secondary">macOS</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {issue.macFix.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {issue.commands
              ?.filter((c) => c.platform === "mac" || c.platform === "all")
              .map((cmd, i) => (
                <CommandBlock key={i} command={cmd.command} lang="bash" />
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
