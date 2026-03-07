"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandBlockProps {
  command: string;
  lang?: string;
}

export function CommandBlock({ command, lang }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg bg-muted">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">{lang ?? "shell"}</span>
        <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="sr-only">{copied ? "已复制" : "复制"}</span>
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code>{command}</code>
      </pre>
    </div>
  );
}
