export type Phase = "environment" | "openclaw" | "feishu";

export interface InstallStep {
  id: string;
  phase: Phase;
  title: string;
  description: string;
  command?: string;
  platformCommands?: {
    mac?: string;
    windows?: string;
  };
  expectedOutput?: string;
  externalLink?: {
    url: string;
    label: string;
  };
  verifiable: boolean;
}

export const phaseLabels: Record<Phase, string> = {
  environment: "环境准备",
  openclaw: "OpenClaw 初始化",
  feishu: "飞书插件接入",
};

export const installSteps: InstallStep[] = [
  // ── Phase 1: 环境准备 ──
  {
    id: "check-node",
    phase: "environment",
    title: "检查 Node.js",
    description:
      "OpenClaw 需要 Node.js 18 或更高版本。打开终端运行以下命令检查是否已安装：",
    platformCommands: {
      mac: "node --version",
      windows: "node --version",
    },
    expectedOutput: "v20.18.0",
    verifiable: true,
  },
  {
    id: "install-node",
    phase: "environment",
    title: "安装 Node.js（如未安装）",
    description:
      "如果上一步提示 command not found 或版本低于 18，需要先安装 Node.js。",
    platformCommands: {
      mac: "brew install node",
      windows:
        "# 前往 https://nodejs.org/ 下载 LTS 版本 .msi 安装包\n# 安装时确保勾选 'Add to PATH'",
    },
    expectedOutput: "v20.18.0",
    verifiable: true,
  },
  {
    id: "check-npm",
    phase: "environment",
    title: "检查 npm",
    description: "确认 npm 已随 Node.js 一起安装：",
    platformCommands: {
      mac: "npm --version",
      windows: "npm --version",
    },
    expectedOutput: "10.8.2",
    verifiable: true,
  },

  // ── Phase 2: OpenClaw 初始化 ──
  {
    id: "install-openclaw",
    phase: "openclaw",
    title: "安装 OpenClaw",
    description: "通过 npm 全局安装 OpenClaw：",
    platformCommands: {
      mac: "npm i -g openclaw",
      windows: "npm i -g openclaw",
    },
    expectedOutput: "added 1 package in 3s",
    verifiable: true,
  },
  {
    id: "openclaw-onboard",
    phase: "openclaw",
    title: "初始化 OpenClaw",
    description:
      "运行 onboard 命令，按照交互式提示完成基础配置（选择 AI 模型和聊天平台）：",
    command: "openclaw onboard",
    verifiable: false,
  },
  {
    id: "connect-model",
    phase: "openclaw",
    title: "连接大模型",
    description:
      "onboard 流程中会提示输入 API Key。如果选择了 Anthropic Claude，需要设置 ANTHROPIC_API_KEY；选择 OpenAI 则需要 OPENAI_API_KEY。确保 key 配置正确：",
    command: "openclaw config get",
    expectedOutput: "model: anthropic/claude-3.5-sonnet\napi_key: sk-***",
    verifiable: true,
  },
  {
    id: "verify-openclaw",
    phase: "openclaw",
    title: "验证安装",
    description: "确认 OpenClaw 已正确安装且服务正常运行：",
    command: "openclaw --version && openclaw status",
    expectedOutput:
      "openclaw v2026.2.26\nStatus: running\nModel: anthropic/claude-3.5-sonnet\nPlugins: 0 loaded",
    verifiable: true,
  },

  // ── Phase 3: 飞书插件接入 ──
  {
    id: "feishu-create-app",
    phase: "feishu",
    title: "创建飞书自建应用",
    description:
      '登录飞书开放平台，创建一个企业自建应用。填写应用名称和描述，然后在「应用能力」中添加「机器人」能力。详细步骤请参考官方文档：',
    externalLink: {
      url: "https://www.feishu.cn/content/article/7613711414611463386",
      label: "飞书插件官方安装指南",
    },
    verifiable: false,
  },
  {
    id: "feishu-permissions",
    phase: "feishu",
    title: "配置应用权限",
    description:
      '在飞书开放平台的应用后台，通过「批量导入/导出权限」功能导入所需权限（消息、文档、日历、多维表格、任务等）。权限 JSON 参考官方文档。',
    externalLink: {
      url: "https://www.feishu.cn/content/article/7613711414611463386",
      label: "查看权限配置详情",
    },
    verifiable: false,
  },
  {
    id: "feishu-publish",
    phase: "feishu",
    title: "发布应用并获取凭证",
    description:
      '创建应用版本并发布，然后在「基础信息 > 凭证与基础信息」中获取 App ID 和 App Secret。这两个值后续安装插件时需要用到。',
    verifiable: false,
  },
  {
    id: "feishu-install-plugin",
    phase: "feishu",
    title: "安装飞书插件",
    description:
      "运行以下命令安装飞书插件，按照提示输入 App ID 和 App Secret：",
    platformCommands: {
      mac: "openclaw plugin install feishu\nfeishu-plugin-onboard install",
      windows:
        "openclaw plugin install feishu\nfeishu-plugin-onboard install",
    },
    expectedOutput: "Feishu plugin installed successfully",
    verifiable: true,
  },
  {
    id: "feishu-gateway",
    phase: "feishu",
    title: "启动网关并配置事件订阅",
    description:
      '启动 OpenClaw 网关。然后回到飞书开放平台，在「事件订阅」中选择「长链接」方式接收事件，添加消息事件：',
    command: "openclaw gateway run",
    expectedOutput: "Gateway started on port 9000\nFeishu plugin loaded",
    verifiable: true,
  },
  {
    id: "feishu-pairing",
    phase: "feishu",
    title: "机器人配对授权",
    description:
      "在飞书中向机器人发送一条消息，机器人会返回一个配对码（5 分钟内有效）。然后在终端执行配对命令：",
    command: "openclaw pairing approve feishu <配对码> --notify",
    verifiable: false,
  },
  {
    id: "feishu-verify",
    phase: "feishu",
    title: "验证飞书插件",
    description: "在飞书对话中发送以下命令确认插件安装成功：",
    command: "openclaw status",
    expectedOutput:
      "Status: running\nPlugins: feishu (v1.0.0) loaded\nFeishu: connected",
    verifiable: true,
  },
];
