export type Phase = "environment" | "openclaw" | "feishu";

export type Platform = "mac" | "windows";

export interface SubStep {
  description: string;
  command: string;
}

export type CommandArea =
  | { mode: "single"; command: string; lang?: string }
  | { mode: "platform"; mac?: string; windows?: string }
  | { mode: "steps"; steps: SubStep[] }
  | { mode: "platformSteps"; mac?: SubStep[]; windows?: SubStep[] };

export interface CopyableBlock {
  label: string;
  content: string;
  lang?: string;
  collapsible?: boolean;
}

export interface ExternalLink {
  url: string;
  label: string;
}

export interface InstallStep {
  id: string;
  phase: Phase;
  title: string;
  description: string;
  platformOnly?: Platform;
  commands?: CommandArea;
  copyable?: CopyableBlock;
  link?: ExternalLink;
  expectedOutput?: string;
  verifiable: boolean;
}

export const phaseLabels: Record<Phase, string> = {
  environment: "环境准备",
  openclaw: "OpenClaw 初始化",
  feishu: "飞书插件接入",
};

const FEISHU_PERMISSIONS_JSON = JSON.stringify(
  {
    scopes: {
      tenant: [
        "docs:document.media:upload",
        "docs:document:export",
        "sheets:spreadsheet.meta:read",
        "sheets:spreadsheet:create",
        "sheets:spreadsheet:read",
        "sheets:spreadsheet:write_only",
        "application:application:self_manage",
        "bitable:app",
        "bitable:app:readonly",
        "calendar:calendar",
        "calendar:calendar.acl:create",
        "calendar:calendar.acl:delete",
        "calendar:calendar.acl:read",
        "calendar:calendar.free_busy:read",
        "calendar:calendar:create",
        "calendar:calendar:delete",
        "calendar:calendar:read",
        "calendar:calendar:readonly",
        "calendar:calendar:subscribe",
        "calendar:calendar:update",
        "cardkit:card:read",
        "cardkit:card:write",
        "contact:contact.base:readonly",
        "contact:user.base:readonly",
        "docx:document",
        "docx:document.block:convert",
        "docx:document:create",
        "docx:document:readonly",
        "drive:drive:readonly",
        "im:chat:read",
        "im:chat:readonly",
        "im:chat:update",
        "im:message",
        "im:message.group_at_msg:readonly",
        "im:message.group_msg",
        "im:message.p2p_msg:readonly",
        "im:message.pins:read",
        "im:message.pins:write_only",
        "im:message.reactions:read",
        "im:message.reactions:write_only",
        "im:message:readonly",
        "im:message:recall",
        "im:message:send_as_bot",
        "im:message:send_multi_users",
        "im:message:send_sys_msg",
        "im:message:update",
        "im:resource",
        "task:attachment:read",
        "task:attachment:write",
        "task:comment",
        "task:comment:read",
        "task:comment:readonly",
        "task:comment:write",
        "task:custom_field:read",
        "task:custom_field:write",
        "task:section:read",
        "task:section:write",
        "task:task",
        "task:task.event_update_tenant:readonly",
        "task:task.privilege:read",
        "task:task:read",
        "task:task:readonly",
        "task:task:write",
        "task:task:writeonly",
        "task:tasklist.privilege:read",
        "task:tasklist:read",
        "task:tasklist:write",
        "wiki:member:create",
        "wiki:node:create",
        "wiki:node:move",
        "wiki:node:read",
        "wiki:node:retrieve",
        "wiki:setting:write_only",
        "wiki:space:write_only",
        "wiki:wiki",
        "wiki:wiki:readonly",
      ],
      user: [
        "base:app:copy",
        "base:app:create",
        "base:app:read",
        "base:app:update",
        "base:field:create",
        "base:field:delete",
        "base:field:read",
        "base:field:update",
        "base:record:create",
        "base:record:delete",
        "base:record:retrieve",
        "base:record:update",
        "base:table:create",
        "base:table:delete",
        "base:table:read",
        "base:table:update",
        "base:view:read",
        "base:view:write_only",
        "board:whiteboard:node:create",
        "board:whiteboard:node:read",
        "calendar:calendar.event:create",
        "calendar:calendar.event:delete",
        "calendar:calendar.event:read",
        "calendar:calendar.event:reply",
        "calendar:calendar.event:update",
        "calendar:calendar.free_busy:read",
        "calendar:calendar:read",
        "contact:contact.base:readonly",
        "contact:user.base:readonly",
        "contact:user.employee_id:readonly",
        "contact:user:search",
        "docs:document.comment:create",
        "docs:document.comment:read",
        "docs:document.comment:update",
        "docs:document.media:download",
        "docs:document:copy",
        "docx:document:create",
        "docx:document:readonly",
        "docx:document:write_only",
        "drive:drive.metadata:readonly",
        "drive:file:download",
        "drive:file:upload",
        "im:chat.members:read",
        "im:chat:read",
        "im:message",
        "im:message.group_msg:get_as_user",
        "im:message.p2p_msg:get_as_user",
        "im:message.send_as_user",
        "im:message:readonly",
        "offline_access",
        "search:docs:read",
        "search:message",
        "space:document:delete",
        "space:document:move",
        "space:document:retrieve",
        "task:comment:read",
        "task:comment:write",
        "task:task:read",
        "task:task:write",
        "task:task:writeonly",
        "task:tasklist:read",
        "task:tasklist:write",
        "wiki:node:copy",
        "wiki:node:create",
        "wiki:node:move",
        "wiki:node:read",
        "wiki:node:retrieve",
        "wiki:space:read",
        "wiki:space:retrieve",
        "wiki:space:write_only",
      ],
    },
  },
  null,
  2,
);

export const installSteps: InstallStep[] = [
  // ── Phase 1: 环境准备 ──
  {
    id: "check-node",
    phase: "environment",
    title: "检查 Node.js",
    description:
      "OpenClaw 需要 Node.js 18 或更高版本。打开终端运行以下命令检查是否已安装：",
    commands: {
      mode: "platform",
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
    link: {
      url: "https://nodejs.org/zh-cn",
      label: "Node.js 官网下载",
    },
    commands: {
      mode: "platform",
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
    commands: {
      mode: "platform",
      mac: "npm --version",
      windows: "npm --version",
    },
    expectedOutput: "10.8.2",
    verifiable: true,
  },

  // ── Phase 2: OpenClaw 初始化 ──
  {
    id: "win-exec-policy",
    phase: "openclaw",
    title: "设置 PowerShell 执行策略",
    description:
      "Windows 默认禁止运行未签名脚本，需要先修改执行策略，否则全局安装的 npm 包可能无法运行：",
    platformOnly: "windows",
    commands: {
      mode: "single",
      command:
        "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser",
      lang: "powershell",
    },
    verifiable: false,
  },
  {
    id: "install-openclaw",
    phase: "openclaw",
    title: "安装 OpenClaw",
    description: "通过 npm 全局安装 OpenClaw。macOS 建议使用独立目录避免权限问题：",
    commands: {
      mode: "platformSteps",
      mac: [
        {
          description: "创建 npm 全局目录",
          command: "mkdir -p ~/.npm-global",
        },
        {
          description: "设置 npm 全局安装路径",
          command: "npm config set prefix ~/.npm-global",
        },
        {
          description: "添加到环境变量",
          command: `echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc`,
        },
        {
          description: "生效配置",
          command: "source ~/.zshrc",
        },
        {
          description: "安装 OpenClaw",
          command: "npm i -g openclaw",
        },
      ],
      windows: [
        {
          description: "安装 OpenClaw",
          command: "npm i -g openclaw",
        },
      ],
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
    commands: { mode: "single", command: "openclaw onboard" },
    verifiable: false,
  },
  {
    id: "connect-model",
    phase: "openclaw",
    title: "连接大模型",
    description:
      "onboard 流程中会提示输入 API Key。如果选择了 Anthropic Claude，需要设置 ANTHROPIC_API_KEY；选择 OpenAI 则需要 OPENAI_API_KEY。确保 key 配置正确：",
    commands: { mode: "single", command: "openclaw config get" },
    expectedOutput: "model: anthropic/claude-3.5-sonnet\napi_key: sk-***",
    verifiable: true,
  },
  {
    id: "verify-openclaw",
    phase: "openclaw",
    title: "验证安装",
    description: "确认 OpenClaw 已正确安装且服务正常运行：",
    commands: {
      mode: "single",
      command: "openclaw --version && openclaw status",
    },
    expectedOutput:
      "openclaw v2026.2.26\nStatus: running\nModel: anthropic/claude-3.5-sonnet\nPlugins: 0 loaded",
    verifiable: true,
  },

  // ── Phase 3: 飞书插件接入 ──
  {
    id: "feishu-create-agent",
    phase: "feishu",
    title: "创建飞书智能体",
    description:
      "登录飞书开放平台，点击「创建企业自建应用」，填写应用名称和描述，然后在「应用能力」中添加「机器人」能力。",
    link: {
      url: "https://open.feishu.cn/app?lang=zh-CN",
      label: "打开飞书开放平台",
    },
    verifiable: false,
  },
  {
    id: "feishu-permissions",
    phase: "feishu",
    title: "导入权限配置",
    description:
      "在飞书应用后台，通过「权限管理 → 批量开通」功能，将以下 JSON 导入以获取所需的全部权限：",
    copyable: {
      label: "权限 JSON",
      content: FEISHU_PERMISSIONS_JSON,
      lang: "json",
      collapsible: true,
    },
    verifiable: false,
  },
  {
    id: "feishu-download-plugin",
    phase: "feishu",
    title: "下载并安装飞书插件",
    description: "运行以下命令下载并全局安装飞书插件 CLI 工具：",
    commands: {
      mode: "platform",
      mac: "curl -o /tmp/feishu-openclaw-plugin-onboard-cli.tgz https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c53145d7b9eb0e29f4e07bf051231230_XjCy46mAFI.tgz && npm install -g /tmp/feishu-openclaw-plugin-onboard-cli.tgz && rm /tmp/feishu-openclaw-plugin-onboard-cli.tgz",
      windows:
        'Invoke-WebRequest -Uri "https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c53145d7b9eb0e29f4e07bf051231230_XjCy46mAFI.tgz" -OutFile "$env:TEMP\\feishu-openclaw-plugin-onboard-cli.tgz"\nnpm install -g "$env:TEMP\\feishu-openclaw-plugin-onboard-cli.tgz"\nRemove-Item "$env:TEMP\\feishu-openclaw-plugin-onboard-cli.tgz"',
    },
    verifiable: false,
  },
  {
    id: "feishu-update",
    phase: "feishu",
    title: "更新插件数据",
    description: "更新飞书插件的本地数据到最新版本：",
    commands: { mode: "single", command: "feishu-plugin-onboard update" },
    verifiable: false,
  },
  {
    id: "feishu-install",
    phase: "feishu",
    title: "安装插件配置",
    description:
      "运行安装命令，按照交互式提示输入 App ID 和 App Secret：",
    commands: { mode: "single", command: "feishu-plugin-onboard install" },
    verifiable: false,
  },
  {
    id: "feishu-doctor",
    phase: "feishu",
    title: "检查并修复",
    description: "运行诊断工具，自动检查并修复配置问题：",
    commands: {
      mode: "single",
      command: "feishu-plugin-onboard doctor --fix",
    },
    verifiable: false,
  },
];
