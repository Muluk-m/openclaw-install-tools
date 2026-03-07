## ADDED Requirements

### Requirement: Global navigation
系统 SHALL 提供顶部导航栏，包含：首页、安装、传输、诊断四个入口，当前页面对应项高亮。

#### Scenario: User navigates between modules
- **WHEN** 用户点击导航栏中的"传输"
- **THEN** 跳转到 /transfer 页面，导航栏"传输"项高亮

#### Scenario: Mobile responsive navigation
- **WHEN** 用户在窄屏设备上查看导航
- **THEN** 导航栏折叠为汉堡菜单，点击展开完整导航

### Requirement: Dark mode
系统 SHALL 支持亮色/暗色主题切换，默认跟随系统偏好。

#### Scenario: System prefers dark mode
- **WHEN** 用户系统设置为暗色模式
- **THEN** 站点自动使用暗色主题

#### Scenario: User toggles theme
- **WHEN** 用户点击主题切换按钮
- **THEN** 主题切换，选择持久化到 localStorage

### Requirement: Landing page
首页 SHALL 展示项目介绍和三大功能模块入口，简洁呈现项目价值。

#### Scenario: User visits landing page
- **WHEN** 用户访问 /
- **THEN** 显示项目名称、简介、三个功能卡片（安装向导、LAN 传输、问题诊断），每个卡片可点击进入对应模块

### Requirement: Responsive design
所有页面 SHALL 在桌面（>1024px）和平板（>768px）上正常显示，核心功能在移动端可用。

#### Scenario: Desktop layout
- **WHEN** 用户在桌面浏览器访问
- **THEN** 内容区最大宽度限制，居中显示，充分利用水平空间

#### Scenario: Tablet and mobile layout
- **WHEN** 用户在平板或手机访问
- **THEN** 布局自动调整为单列，元素适配屏幕宽度
