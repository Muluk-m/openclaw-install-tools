import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface StepContext {
  title: string;
  description: string;
  expectedOutput: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    log: string;
    stepContext?: StepContext;
  };
  const { log, stepContext } = body;

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

    const systemPrompt = stepContext
      ? `你是一个 OpenClaw 安装步骤验证助手。用户正在执行安装步骤「${stepContext.title}」。
步骤说明：${stepContext.description}
期望输出：${stepContext.expectedOutput}

用户会提供他们的实际终端输出。请判断是否符合预期，返回以下 JSON 格式（不要返回其他内容）：
如果通过：
{"pass":true,"message":"简短确认信息"}
如果不通过：
{"pass":false,"errorType":"错误类型","cause":"问题原因","fixSteps":["修复步骤1","修复步骤2"],"commands":["修复命令1"]}`
      : `你是一个 OpenClaw 安装问题诊断助手。用户会提供安装过程中的错误日志。
请分析日志内容，返回以下 JSON 格式（不要返回其他内容）：
{
  "errorType": "错误类型名称",
  "cause": "问题原因分析",
  "fixSteps": ["修复步骤1", "修复步骤2"],
  "commands": ["修复命令1", "修复命令2"]
}
如果无法识别错误，errorType 设为 "未知错误"，并给出通用建议。`;

    const userMessage = stepContext
      ? `我执行了「${stepContext.title}」这一步，以下是我的终端输出：\n\n${log}`
      : `请分析以下安装日志中的错误：\n\n${log}`;

    const result = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    try {
      const parsed = JSON.parse(result.response);
      return NextResponse.json(parsed);
    } catch {
      // AI returned non-JSON, wrap it
      if (stepContext) {
        return NextResponse.json({
          pass: false,
          errorType: "分析结果",
          cause: result.response,
          fixSteps: [],
          commands: [],
        });
      }
      return NextResponse.json({
        errorType: "分析结果",
        cause: result.response,
        fixSteps: [],
        commands: [],
      });
    }
  } catch {
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
