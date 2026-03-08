"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommandBlock } from "./command-block";
import type { InstallStep } from "@/lib/install-steps";

const MAX_CHARS = 10000;

interface VerifyResult {
  pass: boolean;
  message?: string;
  errorType?: string;
  cause?: string;
  fixSteps?: string[];
  commands?: string[];
}

interface StepVerifierProps {
  step: InstallStep;
}

export function StepVerifier({ step }: StepVerifierProps) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");

  const overLimit = output.length > MAX_CHARS;

  const handleVerify = async () => {
    if (!output.trim() || overLimit) return;

    setResult(null);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log: output,
          stepContext: {
            title: step.title,
            description: step.description,
            expectedOutput: step.expectedOutput ?? "",
          },
        }),
      });

      if (!res.ok) {
        throw new Error("AI verification failed");
      }

      const data = (await res.json()) as VerifyResult;
      setResult(data);
    } catch {
      setError("AI 验证暂时不可用，请检查网络后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          粘贴你的终端输出
        </p>
        {output.length > 0 && (
          <span
            className={`text-xs ${overLimit ? "text-destructive" : "text-muted-foreground"}`}
          >
            {output.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        )}
      </div>

      <Textarea
        placeholder="粘贴终端执行后的输出..."
        value={output}
        onChange={(e) => setOutput(e.target.value)}
        rows={4}
        className="font-mono text-sm"
      />

      <Button
        size="sm"
        onClick={handleVerify}
        disabled={loading || !output.trim() || overLimit}
        className="w-fit"
      >
        {loading ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-3.5 w-3.5" />
        )}
        检查
      </Button>

      {result?.pass && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            {result.message ?? "看起来没问题！"}
          </p>
        </div>
      )}

      {result && !result.pass && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {result.errorType ?? "检测到问题"}
            </p>
          </div>

          {result.cause && (
            <p className="text-sm text-red-700 dark:text-red-300">
              {result.cause}
            </p>
          )}

          {result.fixSteps && result.fixSteps.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-red-800 dark:text-red-200">
                修复步骤
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {result.fixSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {result.commands && result.commands.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-red-800 dark:text-red-200">
                修复命令
              </p>
              {result.commands.map((cmd, i) => (
                <CommandBlock key={i} command={cmd} />
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
