# AI-Driven RPA Automation Platform

一个基于AI的智能RPA自动化脚本生成平台，让用户通过简单的操作就能生成可靠的自动化脚本。

## 功能特性

### 1️⃣ 素材采集层
- **视频录制**: 屏幕录制工具集成
- **步骤配置器**: 可视化流程设计器
- **截图管理**: 每步操作的预期结果截图存储

### 2️⃣ AI脚本生成引擎
- **多模态AI解析**: 使用大模型分析视频和截图，提取操作序列
- **脚本生成**: 基于 Playwright 生成浏览器自动化脚本

### 3️⃣ 沙箱验证环境
- **隔离执行**: Docker 容器沙箱运行脚本
- **OCR对比验证**: 使用 PaddleOCR 识别屏幕内容并与截图对比
- **测试数据注入**: 动态替换脚本中的测试数据

### 4️⃣ 脚本交付与执行
- 生成独立可执行脚本
- Web 控制台查看执行日志
- 支持定时任务或手动触发

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design (UI组件)
- React Flow (流程设计器)
- Axios (HTTP客户端)

### 后端
- Node.js + Express
- TypeScript
- Playwright (浏览器自动化)
- Multer (文件上传)
- Bull (任务队列)

### AI & 视觉处理
- OpenAI API / Claude API / GLM API (开发测试)
- LangChain (AI编排)
- PaddleOCR (OCR识别)
- Sharp (图像处理)

### DevOps
- Docker & Docker Compose
- Redis (消息队列)
- PostgreSQL (数据存储)

## 项目结构

```
.
├── client/                 # 前端React应用
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   ├── stores/        # 状态管理
│   │   └── utils/         # 工具函数
│   └── package.json
├── server/                # 后端Node.js应用
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middlewares/   # 中间件
│   │   └── utils/         # 工具函数
│   └── package.json
├── docker/                # Docker配置
├── scripts/               # 工具脚本
└── docs/                  # 文档
```

## 快速开始

### 开发环境要求
- Node.js >= 18.x
- Docker & Docker Compose
- Python 3.8+ (用于OCR服务)

### 安装依赖

```bash
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

### 启动开发服务器

```bash
# 启动后端服务 (端口: 3001)
cd server
npm run dev

# 启动前端服务 (端口: 3000)
cd client
npm start
```

### 使用Docker启动完整环境

```bash
docker-compose up -d
```

## 环境变量配置

在 `server/.env` 文件中配置：

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rpa_platform
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI API Keys
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
GLM_API_KEY=your_glm_key

# OCR Service
OCR_SERVICE_URL=http://localhost:8000

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB
```

## 开发计划

### Phase 1: 基础架构 ✅
- [x] 项目结构搭建
- [x] 前后端框架初始化
- [x] 数据库设计

### Phase 2: 素材采集
- [ ] 流程设计器UI
- [ ] 视频上传与处理
- [ ] 截图管理模块

### Phase 3: AI脚本生成
- [ ] AI服务集成
- [ ] 脚本模板引擎
- [ ] Playwright脚本生成

### Phase 4: 沙箱验证
- [ ] Docker沙箱环境
- [ ] OCR对比验证
- [ ] 测试报告生成

### Phase 5: 脚本交付
- [ ] 脚本打包
- [ ] 执行控制台
- [ ] 定时任务调度

## 许可证

MIT License
