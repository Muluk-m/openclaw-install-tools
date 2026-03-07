export interface ErrorPattern {
  pattern: RegExp;
  slug: string;
  title: string;
  summary: string;
}

export interface IssueDetail {
  slug: string;
  title: string;
  cause: string;
  windowsFix: string[];
  macFix: string[];
  commands?: { platform: "windows" | "mac" | "all"; command: string }[];
}

export const errorPatterns: ErrorPattern[] = [
  {
    pattern: /EACCES|permission denied|Access is denied/i,
    slug: "eacces-permission",
    title: "权限错误 (EACCES)",
    summary: "npm 全局安装时权限不足",
  },
  {
    pattern: /command not found|not recognized|无法将.*识别/i,
    slug: "command-not-found",
    title: "命令未找到",
    summary: "node/npm/openclaw 命令不在系统 PATH 中",
  },
  {
    pattern: /SSL|certificate|CERT_|UNABLE_TO_VERIFY/i,
    slug: "ssl-certificate",
    title: "SSL 证书错误",
    summary: "网络请求因 SSL 证书问题失败",
  },
  {
    pattern: /ETIMEDOUT|ECONNREFUSED|network|timeout|getaddrinfo/i,
    slug: "network-timeout",
    title: "网络连接超时",
    summary: "无法连接到 npm 源或 GitHub",
  },
  {
    pattern: /EADDRINUSE|address already in use|port.*already/i,
    slug: "port-conflict",
    title: "端口被占用",
    summary: "OpenClaw 需要的端口已被其他程序占用",
  },
  {
    pattern: /API.?key|ANTHROPIC_API_KEY|OPENAI_API_KEY|unauthorized|401/i,
    slug: "api-key-config",
    title: "API Key 配置问题",
    summary: "AI 模型的 API Key 未配置或无效",
  },
];

export const issueDetails: Record<string, IssueDetail> = {
  "eacces-permission": {
    slug: "eacces-permission",
    title: "权限错误 (EACCES)",
    cause:
      "在全局安装 npm 包时，系统目录需要管理员权限。这通常发生在直接使用 `npm i -g` 而没有足够权限时。",
    windowsFix: [
      "以管理员身份运行 PowerShell（右键 → 以管理员身份运行）",
      "然后重新执行安装命令",
    ],
    macFix: [
      "方法 1：使用 sudo 运行（不推荐长期使用）",
      "方法 2：修改 npm 全局目录权限",
      "方法 3：使用 nvm 管理 Node.js（推荐）",
    ],
    commands: [
      { platform: "windows", command: "# 右键 PowerShell → 以管理员身份运行\nnpm i -g openclaw" },
      { platform: "mac", command: "# 方法 1: sudo\nsudo npm i -g openclaw" },
      {
        platform: "mac",
        command:
          '# 方法 2: 修改 npm 目录权限\nmkdir -p ~/.npm-global\nnpm config set prefix "~/.npm-global"\n# 添加到 ~/.zshrc:\nexport PATH=~/.npm-global/bin:$PATH',
      },
    ],
  },
  "command-not-found": {
    slug: "command-not-found",
    title: "命令未找到",
    cause:
      "系统找不到 node、npm 或 openclaw 命令，通常是因为没有安装 Node.js，或安装后没有将其添加到系统 PATH 环境变量中。",
    windowsFix: [
      "确认 Node.js 已安装：重新运行安装程序，确保勾选 Add to PATH",
      "重新打开终端（安装后需要新终端才能识别 PATH 变更）",
      "如果是 openclaw 命令找不到，确认全局安装成功",
    ],
    macFix: [
      "运行 `brew install node` 安装 Node.js",
      "如果 brew 命令也找不到，先安装 Homebrew",
      "安装后打开新终端窗口验证",
    ],
    commands: [
      { platform: "all", command: "# 验证安装\nnode --version\nnpm --version\nopenclaw --version" },
    ],
  },
  "ssl-certificate": {
    slug: "ssl-certificate",
    title: "SSL 证书错误",
    cause:
      "网络请求失败，通常由企业代理/防火墙拦截 HTTPS 流量、系统时间不正确、或 npm 缓存损坏导致。",
    windowsFix: [
      "检查系统时间是否正确",
      "如果在公司网络，联系 IT 部门配置代理证书",
      "临时方案：设置 npm 跳过证书验证（不推荐生产使用）",
    ],
    macFix: [
      "检查系统时间：系统偏好设置 → 日期与时间 → 自动设置",
      "清理 npm 缓存",
      "如果在公司网络，配置代理证书",
    ],
    commands: [
      { platform: "all", command: "# 清理 npm 缓存\nnpm cache clean --force" },
      {
        platform: "all",
        command:
          "# 临时跳过证书验证（仅调试用，不推荐）\nnpm config set strict-ssl false",
      },
    ],
  },
  "network-timeout": {
    slug: "network-timeout",
    title: "网络连接超时",
    cause:
      "无法连接到 npm 仓库或 GitHub。可能是网络问题、DNS 问题，或需要配置代理。",
    windowsFix: [
      "检查网络连接",
      "尝试切换 npm 镜像源",
      "如果需要代理，配置 npm 代理设置",
    ],
    macFix: [
      "检查网络连接",
      "尝试切换 npm 镜像源",
      "检查 DNS 设置",
    ],
    commands: [
      {
        platform: "all",
        command:
          "# 使用淘宝镜像源\nnpm config set registry https://registry.npmmirror.com",
      },
      {
        platform: "all",
        command:
          "# 恢复官方源\nnpm config set registry https://registry.npmjs.org",
      },
    ],
  },
  "port-conflict": {
    slug: "port-conflict",
    title: "端口被占用",
    cause:
      "OpenClaw 默认使用的端口（如 3000、8080）已经被其他应用程序占用。",
    windowsFix: [
      "查找占用端口的进程并关闭",
      "或修改 OpenClaw 配置使用其他端口",
    ],
    macFix: [
      "查找占用端口的进程",
      "关闭占用进程或修改端口配置",
    ],
    commands: [
      {
        platform: "windows",
        command: "# 查找占用端口的进程\nnetstat -ano | findstr :3000\n# 终止进程 (替换 PID)\ntaskkill /PID <PID> /F",
      },
      {
        platform: "mac",
        command: "# 查找占用端口的进程\nlsof -i :3000\n# 终止进程 (替换 PID)\nkill -9 <PID>",
      },
    ],
  },
  "api-key-config": {
    slug: "api-key-config",
    title: "API Key 配置问题",
    cause:
      "OpenClaw 需要 AI 模型的 API Key 才能工作。如果 Key 未设置或无效，会报身份验证错误。",
    windowsFix: [
      "获取 API Key（Anthropic Console 或 OpenAI Platform）",
      "通过 openclaw onboard 重新配置",
      "或手动设置环境变量",
    ],
    macFix: [
      "获取 API Key（Anthropic Console 或 OpenAI Platform）",
      "通过 openclaw onboard 重新配置",
      "或在 ~/.zshrc 中设置环境变量",
    ],
    commands: [
      { platform: "all", command: "# 重新运行配置向导\nopenclaw onboard" },
      {
        platform: "mac",
        command:
          '# 手动设置环境变量 (添加到 ~/.zshrc)\nexport ANTHROPIC_API_KEY="sk-ant-..."',
      },
      {
        platform: "windows",
        command:
          '# 手动设置环境变量\n[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")',
      },
    ],
  },
};

export function matchError(input: string): ErrorPattern | null {
  for (const pattern of errorPatterns) {
    if (pattern.pattern.test(input)) {
      return pattern;
    }
  }
  return null;
}
