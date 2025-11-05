# 系统架构文档

## 架构概览

RPA AI 自动化平台采用前后端分离的微服务架构，通过AI驱动实现智能化的RPA脚本生成。

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                  (React + Ant Design + TS)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────┴─────────────────────────────────┐
│                         API Layer                            │
│                  (Node.js + Express + TS)                    │
├──────────────────────────────────────────────────────────────┤
│  Controllers → Services → Utils                              │
│  • WorkflowController    • WorkflowService                   │
│  • ScriptController      • AIScriptGeneratorService          │
│  • ExecutionController   • SandboxValidationService          │
│  • UploadController      • OCRService                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼──────┐      ┌──────▼──────┐     ┌──────▼──────┐
│  PostgreSQL │      │    Redis    │     │ OCR Service │
│  (数据存储)  │      │  (消息队列)  │     │ (PaddleOCR) │
└─────────────┘      └─────────────┘     └─────────────┘
                            │
                     ┌──────▼──────┐
                     │   Docker    │
                     │  (沙箱环境)  │
                     └─────────────┘
```

## 核心模块

### 1. 素材采集层 (Material Collection)

**功能：**
- 视频上传与处理
- 截图批量上传
- 步骤流程配置

**技术实现：**
- Multer: 文件上传中间件
- Sharp: 图像处理和优化
- FFmpeg: 视频处理（未来扩展）

### 2. AI脚本生成引擎 (AI Script Generator)

**功能：**
- 解析工作流步骤
- 调用LLM生成脚本
- 代码模板引擎

**技术实现：**
- OpenAI API / Claude API: 多模态AI分析
- LangChain: AI工作流编排
- Playwright: 浏览器自动化框架

**生成流程：**
```
用户工作流 → 构建Prompt → AI生成代码 → 代码清理 → 保存脚本
```

### 3. 沙箱验证环境 (Sandbox Validation)

**功能：**
- 隔离执行脚本
- OCR截图对比
- 生成验证报告

**技术实现：**
- Docker: 容器化沙箱
- Playwright: 浏览器自动化
- PaddleOCR: 中文OCR识别
- OpenCV: 图像相似度对比（未来扩展）

**验证流程：**
```
脚本执行 → 每步截图 → OCR识别 → 与预期对比 → 生成报告
```

### 4. 脚本交付执行 (Script Delivery)

**功能：**
- 脚本下载
- 实时执行
- 日志监控

**技术实现：**
- Bull: 任务队列
- Winston: 日志系统
- WebSocket: 实时通信（未来扩展）

## 数据模型

### Workflow (工作流)
```typescript
{
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  videoUrl: string
  status: 'draft' | 'ready' | 'generating' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}
```

### WorkflowStep (工作流步骤)
```typescript
{
  id: string
  order: number
  action: string              // click, fill, navigate, select, wait
  target: string              // CSS selector or XPath
  value: string               // Input value (optional)
  screenshotUrl: string       // Expected screenshot
  description: string
}
```

### Script (脚本)
```typescript
{
  id: string
  workflowId: string
  name: string
  code: string
  language: 'javascript' | 'python'
  framework: 'playwright' | 'puppeteer' | 'selenium'
  filePath: string
  status: 'pending' | 'validated' | 'failed'
  validationResult: ValidationResult
  createdAt: Date
  updatedAt: Date
}
```

### Execution (执行记录)
```typescript
{
  id: string
  scriptId: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  parameters: any
  startTime: Date
  endTime: Date
  duration: number
  logs: ExecutionLog[]
  error: string
}
```

## API 接口设计

### Workflow APIs
- `POST /api/v1/workflows` - 创建工作流
- `GET /api/v1/workflows` - 获取工作流列表
- `GET /api/v1/workflows/:id` - 获取工作流详情
- `PUT /api/v1/workflows/:id` - 更新工作流
- `DELETE /api/v1/workflows/:id` - 删除工作流
- `POST /api/v1/workflows/:id/generate-script` - 生成脚本

### Script APIs
- `GET /api/v1/scripts` - 获取脚本列表
- `GET /api/v1/scripts/:id` - 获取脚本详情
- `GET /api/v1/scripts/:id/download` - 下载脚本
- `POST /api/v1/scripts/:id/validate` - 验证脚本
- `DELETE /api/v1/scripts/:id` - 删除脚本

### Execution APIs
- `POST /api/v1/executions` - 执行脚本
- `GET /api/v1/executions` - 获取执行记录
- `GET /api/v1/executions/:id` - 获取执行详情
- `GET /api/v1/executions/:id/logs` - 获取执行日志
- `POST /api/v1/executions/:id/stop` - 停止执行

### Upload APIs
- `POST /api/v1/uploads/video` - 上传视频
- `POST /api/v1/uploads/screenshot` - 上传截图
- `POST /api/v1/uploads/screenshots/batch` - 批量上传截图
- `DELETE /api/v1/uploads/:id` - 删除文件

## 安全性考虑

1. **输入验证**: 使用Joi进行请求参数验证
2. **文件上传限制**: 限制文件类型和大小
3. **沙箱隔离**: Docker容器隔离脚本执行
4. **API认证**: JWT Token认证（未来扩展）
5. **代码注入防护**: 脚本执行前的安全检查

## 扩展性设计

1. **插件系统**: 支持自定义AI提供商
2. **多框架支持**: Playwright, Puppeteer, Selenium
3. **多语言支持**: JavaScript, Python, Java
4. **分布式执行**: 通过消息队列实现任务分发
5. **监控告警**: 集成Prometheus + Grafana

## 性能优化

1. **脚本缓存**: Redis缓存生成的脚本
2. **图片压缩**: Sharp压缩上传的截图
3. **异步处理**: Bull队列处理耗时任务
4. **连接池**: 数据库连接池优化
5. **CDN加速**: 静态资源CDN分发
