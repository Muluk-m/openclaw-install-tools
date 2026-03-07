export type Platform = "windows" | "mac";

export interface CommandDef {
  command: string;
  lang?: string;
}

export interface BranchOption {
  label: string;
  description?: string;
  nextStepId: string;
}

export interface StepNode {
  id: string;
  title: string;
  description?: string;
  commands?: CommandDef[];
  branches?: BranchOption[];
  nextStepId?: string;
  isFinal?: boolean;
}

export interface StepTree {
  platform: Platform;
  title: string;
  startStepId: string;
  steps: Record<string, StepNode>;
}

export const windowsSteps: StepTree = {
  platform: "windows",
  title: "Windows 安装向导",
  startStepId: "check-node",
  steps: {
    "check-node": {
      id: "check-node",
      title: "检查 Node.js 环境",
      description:
        "OpenClaw 需要 Node.js 18 或更高版本。打开 PowerShell 或命令提示符，运行以下命令检查：",
      commands: [{ command: "node --version", lang: "powershell" }],
      branches: [
        {
          label: "已安装 (v18+)",
          description: "输出类似 v18.x.x 或更高",
          nextStepId: "install-method",
        },
        {
          label: "未安装或版本过低",
          description: "报错或版本低于 18",
          nextStepId: "install-node",
        },
      ],
    },
    "install-node": {
      id: "install-node",
      title: "安装 Node.js",
      description:
        '前往 Node.js 官网下载 LTS 版本安装包，安装时勾选 "Add to PATH" 选项。安装完成后重新打开终端验证：',
      commands: [
        { command: "# 下载地址: https://nodejs.org/\n# 选择 LTS 版本，下载 .msi 安装包\n# 安装时确保勾选 'Add to PATH'", lang: "powershell" },
        { command: "node --version\nnpm --version", lang: "powershell" },
      ],
      nextStepId: "install-method",
    },
    "install-method": {
      id: "install-method",
      title: "选择安装方式",
      description: "推荐使用 npm 全局安装，简单快捷。如果你想修改源码，选择 Git 克隆方式。",
      branches: [
        {
          label: "npm 安装 (推荐)",
          description: "一行命令，全局安装",
          nextStepId: "npm-install",
        },
        {
          label: "Git 克隆",
          description: "适合开发者，可修改源码",
          nextStepId: "git-install",
        },
      ],
    },
    "npm-install": {
      id: "npm-install",
      title: "通过 npm 安装 OpenClaw",
      description: "以管理员身份打开 PowerShell，运行以下命令：",
      commands: [{ command: "npm i -g openclaw", lang: "powershell" }],
      nextStepId: "onboard",
    },
    "git-install": {
      id: "git-install",
      title: "通过 Git 克隆安装",
      description: "确保已安装 Git 和 pnpm，然后运行：",
      commands: [
        {
          command:
            "git clone https://github.com/nicepkg/openclaw.git\ncd openclaw\npnpm install\npnpm build",
          lang: "powershell",
        },
      ],
      nextStepId: "onboard",
    },
    onboard: {
      id: "onboard",
      title: "初始化配置",
      description: "运行 onboard 命令，按提示选择 AI 模型和聊天平台：",
      commands: [{ command: "openclaw onboard", lang: "powershell" }],
      nextStepId: "verify",
    },
    verify: {
      id: "verify",
      title: "验证安装",
      description: "运行以下命令确认 OpenClaw 正常工作：",
      commands: [{ command: "openclaw --version\nopenclaw status", lang: "powershell" }],
      isFinal: true,
    },
  },
};

export const macSteps: StepTree = {
  platform: "mac",
  title: "macOS 安装向导",
  startStepId: "check-homebrew",
  steps: {
    "check-homebrew": {
      id: "check-homebrew",
      title: "检查 Homebrew",
      description:
        "Homebrew 是 macOS 的包管理器，方便安装 Node.js 等依赖。检查是否已安装：",
      commands: [{ command: "brew --version", lang: "bash" }],
      branches: [
        {
          label: "已安装",
          description: "输出 Homebrew 版本号",
          nextStepId: "check-node",
        },
        {
          label: "未安装",
          description: "报错 command not found",
          nextStepId: "install-homebrew",
        },
      ],
    },
    "install-homebrew": {
      id: "install-homebrew",
      title: "安装 Homebrew",
      description: "在终端中运行以下命令安装 Homebrew：",
      commands: [
        {
          command:
            '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
          lang: "bash",
        },
      ],
      nextStepId: "check-node",
    },
    "check-node": {
      id: "check-node",
      title: "检查 Node.js 环境",
      description: "OpenClaw 需要 Node.js 18 或更高版本：",
      commands: [{ command: "node --version", lang: "bash" }],
      branches: [
        {
          label: "已安装 (v18+)",
          description: "输出类似 v18.x.x 或更高",
          nextStepId: "install-method",
        },
        {
          label: "未安装或版本过低",
          nextStepId: "install-node",
        },
      ],
    },
    "install-node": {
      id: "install-node",
      title: "安装 Node.js",
      description: "通过 Homebrew 安装最新 LTS 版本的 Node.js：",
      commands: [
        { command: "brew install node", lang: "bash" },
        { command: "node --version\nnpm --version", lang: "bash" },
      ],
      nextStepId: "install-method",
    },
    "install-method": {
      id: "install-method",
      title: "选择安装方式",
      description: "macOS 支持三种安装方式：",
      branches: [
        {
          label: "curl 一键安装 (推荐)",
          description: "最快捷的方式",
          nextStepId: "curl-install",
        },
        {
          label: "npm 安装",
          description: "全局 npm 包",
          nextStepId: "npm-install",
        },
        {
          label: "Git 克隆",
          description: "适合开发者",
          nextStepId: "git-install",
        },
      ],
    },
    "curl-install": {
      id: "curl-install",
      title: "通过 curl 一键安装",
      description: "运行以下命令，脚本会自动处理所有依赖：",
      commands: [
        {
          command: "curl -fsSL https://openclaw.ai/install.sh | bash",
          lang: "bash",
        },
      ],
      nextStepId: "onboard",
    },
    "npm-install": {
      id: "npm-install",
      title: "通过 npm 安装 OpenClaw",
      commands: [{ command: "npm i -g openclaw", lang: "bash" }],
      nextStepId: "onboard",
    },
    "git-install": {
      id: "git-install",
      title: "通过 Git 克隆安装",
      description: "确保已安装 pnpm（`npm i -g pnpm`），然后运行：",
      commands: [
        {
          command:
            "git clone https://github.com/nicepkg/openclaw.git\ncd openclaw\npnpm install\npnpm build",
          lang: "bash",
        },
      ],
      nextStepId: "onboard",
    },
    onboard: {
      id: "onboard",
      title: "初始化配置",
      description: "运行 onboard 命令，按提示选择 AI 模型和聊天平台：",
      commands: [{ command: "openclaw onboard", lang: "bash" }],
      nextStepId: "verify",
    },
    verify: {
      id: "verify",
      title: "验证安装",
      description: "运行以下命令确认 OpenClaw 正常工作：",
      commands: [{ command: "openclaw --version\nopenclaw status", lang: "bash" }],
      isFinal: true,
    },
  },
};
