import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  const { log } = (await request.json()) as { log: string };

  if (!log || log.trim().length === 0) {
    return NextResponse.json(
      { error: "No log content provided" },
      { status: 400 }
    );
  }

  if (log.length > 10000) {
    return NextResponse.json(
      { error: "Log content too long (max 10000 chars)" },
      { status: 400 }
    );
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const ai = (env as Record<string, unknown>).AI as {
      run: (
        model: string,
        options: { messages: { role: string; content: string }[] }
      ) => Promise<{ response: string }>;
    };

    if (!ai) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const result = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: `你是一个 OpenClaw 安装问题诊断助手。用户会提供安装过程中的错误日志。
请分析日志内容，返回以下 JSON 格式（不要返回其他内容）：
{
  "errorType": "错误类型名称",
  "cause": "问题原因分析",
  "fixSteps": ["修复步骤1", "修复步骤2"],
  "commands": ["修复命令1", "修复命令2"]
}
如果无法识别错误，errorType 设为 "未知错误"，并给出通用建议。`,
        },
        {
          role: "user",
          content: `请分析以下安装日志中的错误：\n\n${log}`,
        },
      ],
    });

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(result.response);
      return NextResponse.json(parsed);
    } catch {
      // AI returned non-JSON, wrap it
      return NextResponse.json({
        errorType: "分析结果",
        cause: result.response,
        fixSteps: [],
        commands: [],
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
