"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { errorPatterns, matchError } from "@/lib/error-patterns";

export default function DebugPage() {
  const [query, setQuery] = useState("");

  const matched = query.trim() ? matchError(query) : null;

  const filteredPatterns = query.trim()
    ? errorPatterns.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.summary.toLowerCase().includes(query.toLowerCase()) ||
          p.pattern.test(query)
      )
    : errorPatterns;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">问题诊断</h1>
        <p className="mt-2 text-muted-foreground">
          搜索安装错误信息，获取修复方案
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="输入错误信息关键词，如 EACCES、command not found..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {query.trim() && filteredPatterns.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-muted-foreground">未找到匹配的已知问题</p>
          <Link
            href="/debug/analyze"
            className={buttonVariants({ variant: "default" })}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            试试 AI 分析
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPatterns.map((pattern) => (
          <Link key={pattern.slug} href={`/debug/${pattern.slug}`} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{pattern.title}</CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <CardDescription>{pattern.summary}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/debug/analyze"
          className={buttonVariants({ variant: "outline" })}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI 日志分析器
        </Link>
      </div>
    </div>
  );
}
