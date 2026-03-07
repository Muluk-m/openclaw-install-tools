## 1. Project Setup & App Shell

- [x] 1.1 Install dependencies: shadcn/ui, lucide-react, shiki, framer-motion, zustand
- [x] 1.2 Initialize shadcn/ui (run init, configure tailwind v4 integration)
- [x] 1.3 Add common shadcn components: Button, Card, Input, Badge, Tabs, Dialog, DropdownMenu, Sheet
- [x] 1.4 Create global layout (src/app/layout.tsx): navigation bar with logo + 4 nav items (首页/安装/传输/诊断), mobile hamburger menu (Sheet), theme toggle button
- [x] 1.5 Implement dark mode: next-themes provider, system preference detection, localStorage persistence
- [x] 1.6 Create Landing page (src/app/page.tsx): project hero section, 3 feature cards (安装向导/LAN 传输/问题诊断) linking to respective modules
- [x] 1.7 Set up project metadata (title, description, favicon) in layout.tsx

## 2. Install Wizard - Core

- [x] 2.1 Define step tree data structure in lib/install-steps.ts: StepNode type with id, title, content, branches, next, platform fields
- [x] 2.2 Create wizard state store (stores/wizard-store.ts): current step, history stack, branch selections, navigation (next/prev)
- [x] 2.3 Build StepWizard component (components/install/step-wizard.tsx): reads step tree, renders current step, handles navigation and branching
- [x] 2.4 Build StepCard component (components/install/step-card.tsx): card UI for a single step with title, content area, action buttons
- [x] 2.5 Build CommandBlock component (components/install/command-block.tsx): Shiki syntax-highlighted code block with one-click copy button and "已复制" feedback
- [x] 2.6 Build BranchSelector component (components/install/branch-selector.tsx): renders branching choices (e.g. "有 Node.js / 没有"), updates wizard store on selection

## 3. Install Wizard - Platform Flows

- [x] 3.1 Create /install page (src/app/install/page.tsx): OS auto-detection via User-Agent, platform selection cards (Windows/macOS) with detected platform highlighted
- [x] 3.2 Define Windows step tree data: Check Node.js → (branch: have/don't have) → Install method (npm/git) → Install commands → Onboard config → Verify
- [x] 3.3 Create /install/windows page: render StepWizard with Windows step tree
- [x] 3.4 Define macOS step tree data: Check Homebrew → Check Node.js → Install method (curl/npm/git) → Install commands → Onboard config → Verify
- [x] 3.5 Create /install/mac page: render StepWizard with macOS step tree

## 4. Install Command Customizer

- [x] 4.1 Create /install/customize page with form: platform select, install method select, AI model select, chat platform multi-select
- [x] 4.2 Implement dynamic option filtering (curl disabled on Windows, etc.)
- [x] 4.3 Implement real-time command generation from selections, rendered in CommandBlock
- [x] 4.4 Add copy button for generated command

## 5. LAN Transfer - Signaling Server

- [x] 5.1 Create Durable Object class (src/worker/signaling.ts or separate worker file): room state management, WebSocket handling, SDP/ICE relay between two peers
- [x] 5.2 Add API routes for room management: POST /api/room/create (generate 4-digit room code), POST /api/room/join (validate room code, upgrade to WebSocket)
- [x] 5.3 Configure wrangler.jsonc: add Durable Object binding for signaling
- [x] 5.4 Implement room expiry: 5-minute timeout via Durable Object alarm API

## 6. LAN Transfer - WebRTC Client

- [x] 6.1 Create WebRTC connection manager (lib/webrtc.ts): RTCPeerConnection setup, DataChannel creation, SDP offer/answer exchange, ICE candidate handling, connection state events
- [x] 6.2 Create signaling client (lib/signaling.ts): WebSocket connection to Durable Object, send/receive SDP and ICE messages, room lifecycle events
- [x] 6.3 Create transfer state store (stores/transfer-store.ts): connection status, room code, peer state, transfer queue, clipboard sync state

## 7. LAN Transfer - UI

- [x] 7.1 Create /transfer page: "创建房间" and "加入房间" entry cards
- [x] 7.2 Build RoomCreate component: call create API, display room code, show "等待对方加入" status
- [x] 7.3 Build RoomJoin component: 4-digit input, join button, error handling for invalid/expired rooms
- [x] 7.4 Create /transfer/room page: connection status bar, tabbed interface for file/text/clipboard
- [x] 7.5 Build ConnectionStatus component: connected/disconnected/connecting states with visual indicators
- [x] 7.6 Build FileSender component: file picker, send button, progress bar
- [x] 7.7 Build FileReceiver component: incoming file notification, progress bar, download button
- [x] 7.8 Build text send/receive UI: text input area with send button, received messages list with copy button
- [x] 7.9 Build ClipboardSync component: enable/disable toggle, permission request handling, fallback to manual paste

## 8. Debug Diagnostics

- [x] 8.1 Define error patterns library (lib/error-patterns.ts): array of { pattern: RegExp, slug: string, title: string, summary: string } for known OpenClaw install errors
- [x] 8.2 Create /debug page: search input with real-time filtering against error patterns, popular issues grid below
- [x] 8.3 Create /debug/[slug] page: issue detail with cause explanation, Windows fix steps, macOS fix steps, copyable commands
- [x] 8.4 Add initial content for common issues: EACCES permission error, command not found (node/npm), SSL certificate problem, network timeout, port conflict (3000/8080), API key configuration

## 9. AI Log Analyzer

- [x] 9.1 Create Workers AI API route (src/app/api/analyze/route.ts): accept log text, call Workers AI (llama model), return structured diagnosis
- [x] 9.2 Configure wrangler.jsonc: add AI binding
- [x] 9.3 Create /debug/analyze page: text area for log input, privacy notice, analyze button
- [x] 9.4 Build LogAnalyzer component: two-tier flow (check error-patterns first → fallback to AI API), loading state, structured result display (error type, cause, fix steps, commands)
- [x] 9.5 Handle AI failure gracefully: show fallback message with link to /debug

## 10. Polish & Open Source

- [x] 10.1 Add Framer Motion page transitions and step wizard animations
- [x] 10.2 Verify responsive layout on desktop, tablet, mobile breakpoints
- [x] 10.3 Add proper Open Graph meta tags for social sharing
- [x] 10.4 Add LICENSE file (MIT)
- [x] 10.5 Update README.md with project description, features, development setup, contributing guide
