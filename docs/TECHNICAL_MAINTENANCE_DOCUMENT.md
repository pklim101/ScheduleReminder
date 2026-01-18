# Schedule Reminder Extension - 技术维护文档

## 1. 系统架构

### 1.1 技术栈
- **核心框架**: React 18 + TypeScript
- **构建工具**: Vite 6 (配合 `@crxjs/vite-plugin` 或手动 Rollup 配置)
- **样式库**: Tailwind CSS 3
- **图标库**: Lucide React
- **时间处理**: date-fns
- **扩展标准**: Chrome Extension Manifest V3

### 1.2 目录结构
```
chrome_reminder_ext/
├── dist/                  # 构建产物 (用于加载到浏览器)
├── public/                # 静态资源 (icons, manifest模板)
├── src/
│   ├── components/        # React 组件
│   │   ├── AddReminderForm.tsx  # 添加/编辑表单
│   │   ├── ReminderItem.tsx     # 列表项组件
│   │   └── ReminderPopup.tsx    # 独立提醒弹窗组件
│   ├── utils/             # 工具函数
│   │   ├── alarms.ts      # Chrome Alarms API 封装
│   │   ├── date.ts        # 日期计算与重复逻辑
│   │   └── storage.ts     # Chrome Storage API 封装
│   ├── App.tsx            # 主界面逻辑 (路由分发)
│   ├── background.ts      # 后台服务 Worker
│   ├── main.tsx           # React 入口
│   └── types.ts           # TypeScript 类型定义
├── manifest.json          # 扩展配置文件
└── vite.config.ts         # 构建配置
```

## 2. 核心模块说明

### 2.1 后台服务 (`background.ts`)
- **职责**：监听闹钟触发事件 `chrome.alarms.onAlarm`。
- **逻辑**：
  1. 闹钟触发时，根据 ID 查找对应提醒数据。
  2. 发送系统通知 (`chrome.notifications`).
  3. 创建独立弹窗窗口 (`chrome.windows.create`)，指向 `index.html?type=reminder...`。
  4. 处理重复逻辑：计算下一次时间并重置闹钟。

### 2.2 数据存储 (`src/utils/storage.ts`)
- **存储方案**：`chrome.storage.local`。
- **数据结构**：
  ```typescript
  interface Reminder {
    id: string;
    title: string;
    targetTime: number; // Timestamp
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    note?: string;
    enabled: boolean;
    createdAt: number;
  }
  ```

### 2.3 路由与视图 (`App.tsx`)
- **单一入口**：扩展的所有界面（Popup 和 独立窗口）都共享同一个 `index.html` 和 `App.tsx`。
- **路由判断**：通过 URL 参数 `window.location.search` 判断当前模式。
  - 无参数：显示主列表界面。
  - `?type=reminder`：显示独立提醒弹窗界面。

## 3. 构建与发布

### 3.1 开发环境
```bash
npm install   # 安装依赖
npm run dev   # 启动开发服务器 (监听模式)
```

### 3.2 生产构建
```bash
npm run build
```
构建命令会执行 `tsc` 类型检查和 `vite build` 打包。产物输出到 `dist/` 目录。

### 3.3 图标配置
- 源文件位于 `chrome_reminder_ext/icons/ori.png`。
- 构建时通过 `cp` 命令生成不同尺寸的 PNG 图标 (`icon16.png` 等) 到 `dist` 根目录。
- `manifest.json` 已配置 `action.default_icon` 和 `icons` 指向这些 PNG 文件。

## 4. 常见问题排查

### 4.1 提醒不弹窗
- 检查 Chrome 是否允许该扩展发送通知。
- 检查系统（操作系统）的“勿扰模式”是否开启。
- 确认后台 Service Worker 是否存活（Manifest V3 Service Worker 会自动休眠，但在 Alarm 触发时应自动唤醒）。

### 4.2 图标模糊
- 确保 `dist` 目录下存在 PNG 格式的图标。
- 检查 `manifest.json` 中是否错误引用了 `.ico` 文件（应使用 `.png`）。

### 4.3 时间显示错误
- 检查 `date-fns` 或 `Date` 对象是否正确处理了时区偏移。当前实现使用 `new Date().getTimezoneOffset()` 修正本地时间显示。

## 5. 维护指南
- **添加新功能**：优先在 `src/components` 下创建新组件，保持 `App.tsx` 简洁。
- **修改样式**：直接修改组件内的 Tailwind 类名。
- **API 变更**：如需使用新的 Chrome API，记得在 `manifest.json` 的 `permissions` 中声明。
