# 僵尸打字练习 (Zombie Typist)

一款基于 Vue 3 和 TypeScript 开发的僵尸主题打字练习游戏。通过射击带有字母、数字和符号的僵尸来提升你的打字速度和准确性。

## 🎮 游戏特色

- **两种游戏模式**
  - **生存模式**：难度随分数递增，挑战你的极限
  - **练习模式**：自定义僵尸速度，适合针对性练习

- **渐进式难度系统**
  - Level 1: 核心键位 (F, J)
  - Level 2: 扩展键位 (F, J, D, K, S, L)
  - Level 3: 完整主行 (A, S, D, F, J, K, L, ;)
  - Level 4: 顶部行 (R, U, E, I, W, O, Q, P)
  - Level 5: 所有字母键
  - Level 6: 字母 + 数字
  - Level 7: 混乱模式 (包含特殊符号)

- **丰富的游戏机制**
  - 连击系统（Combo）
  - 速度奖励
  - 实时战斗日志
  - 枪口闪光和弹道追踪效果

- **数据持久化**
  - 本地存储最高分
  - 记录最大连击数

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🎯 游戏操作

| 按键 | 功能 |
|------|------|
| `A-Z` / `0-9` | 射击对应僵尸 |
| `Shift + 符号键` | 输入符号（如 @, #, $ 等） |
| `ESC` | 暂停/继续游戏 |

## 📊 游戏规则

### 得分规则
- **基础分**: 击杀僵尸 +20 分
- **速度奖励**: 快速反应 +15 分
- **连击奖励**: Combo × 10 分（最高 500 分）
- **最大连击**: 记录单次游戏最高连击数

### 扣分规则
- **射击失误**: 扣除 5 分
- **僵尸突破**: 扣除 10 分

### 游戏结束
- 当分数 ≤ 0 时游戏结束

## 🏗️ 技术栈

- **框架**: Vue 3.5.24 (Composition API)
- **语言**: TypeScript 5.9.3
- **构建工具**: Vite 7.2.4
- **样式**: Sass 1.97.2
- **图表**: Chart.js 4.5.1
- **渲染**: HTML5 Canvas

## 📁 项目结构

```
xmjs/
├── public/                 # 静态资源
├── src/
│   ├── components/        # Vue 组件
│   │   ├── BottomPanel.vue      # 底部信息面板
│   │   ├── GameCanvas.vue       # 游戏画布
│   │   ├── GameOver.vue         # 游戏结束界面
│   │   ├── HUD.vue              # 抬头显示
│   │   ├── MainMenu.vue        # 主菜单
│   │   ├── SidePanel.vue        # 侧边信息面板
│   │   └── VirtualKeyboard.vue  # 虚拟键盘
│   ├── game/              # 游戏逻辑
│   │   ├── Engine.ts           # 游戏引擎
│   │   ├── SoundManager.ts     # 声音管理
│   │   └── Zombie.ts           # 僵尸类
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   └── style.css          # 全局样式
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
└── tsconfig.json          # TypeScript 配置
```

## 🔧 开发说明

### 核心组件

- **GameEngine (Engine.ts)**: 游戏主引擎，负责游戏循环、状态管理和物理计算
- **Zombie (Zombie.ts)**: 僵尸实体类，处理僵尸的移动、渲染和死亡逻辑
- **SoundManager (SoundManager.ts)**: 声音管理器，处理游戏音效

### 状态管理

使用 Vue 3 的 `reactive` API 进行响应式状态管理，游戏状态包括：
- 游戏状态（菜单/进行中/暂停/结束）
- 游戏模式（生存/练习）
- 统计数据（分数、时间、连击等）
- 僵尸列表
- 战斗日志

## 📝 待实现功能

- [ ] 添加更多游戏音效
- [ ] 增加道具系统
- [ ] 支持自定义键盘布局
- [ ] 添加在线排行榜
- [ ] 多语言支持
- [ ] 主题切换功能

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受打字练习的乐趣！** 💀⌨️
