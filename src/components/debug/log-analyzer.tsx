"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommandBlock } from "@/components/install/command-block";
import { matchError, issueDetails } from "@/lib/error-patterns";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface AIResult {
  errorType: string;
  cause: string;
  fixSteps: string[];
  commands: string[];
}

export function LogAnalyzer() {
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [localMatch, setLocalMatch] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!log.trim()) return;

    setResult(null);
    setLocalMatch(null);
    setError("");

    // First: try local pattern matching
    const match = matchError(log);
    if (match) {
      setLocalMatch(match.slug);
      return;
    }

    // Second: call AI
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log }),
      });

      if (!res.ok) {
        throw new Error("AI analysis failed");
      }

      const data = (await res.json()) as AIResult;
      setResult(data);
    } catch {
      setError("AI 分析暂时不可用，请查看常见问题库");
    } finally {
      setLoading(false);
    }
  };

  const matchedIssue = localMatch ? issueDetails[localMatch] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        您的日志内容将发送至 Cloudflare Workers AI 进行分析，不会被存储。
      </div>

      <Textarea
        placeholder="粘贴终端报错日志..."
        value={log}
        onChange={(e) => setLog(e.target.value)}
        rows={8}
        className="font-mono text-sm"
      />

      <Button onClick={handleAnalyze} disabled={loading || !log.trim()}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        分析日志
      </Button>

      {matchedIssue && (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{matchedIssue.title}</CardTitle>
              <Badge variant="secondary">本地匹配</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{matchedIssue.cause}</p>
            <Link
              href={`/debug/${matchedIssue.slug}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              查看完整修复方案
            </Link>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{result.errorType}</CardTitle>
              <Badge>AI 分析</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium">可能原因</h4>
              <p className="text-sm text-muted-foreground">{result.cause}</p>
            </div>

            {result.fixSteps.length > 0 && (
              <div>
                <h4 className="mb-1 text-sm font-medium">修复步骤</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {result.fixSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.commands.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">修复命令</h4>
                {result.commands.map((cmd, i) => (
                  <CommandBlock key={i} command={cmd} lang="bash" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-destructive">{error}</p>
          <Link href="/debug" className={buttonVariants({ variant: "outline" })}>
            查看常见问题库
          </Link>
        </div>
      )}
    </div>
  );
}
