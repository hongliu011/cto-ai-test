# API 接口文档

Base URL: `http://localhost:3001/api/v1`

## 工作流管理 (Workflows)

### 1. 创建工作流

**请求:**
```http
POST /workflows
Content-Type: application/json

{
  "name": "网页数据采集流程",
  "description": "自动登录并采集数据",
  "steps": [
    {
      "order": 1,
      "action": "navigate",
      "target": "https://example.com",
      "description": "打开目标网页"
    },
    {
      "order": 2,
      "action": "fill",
      "target": "#username",
      "value": "admin",
      "description": "输入用户名"
    },
    {
      "order": 3,
      "action": "click",
      "target": "button.login",
      "description": "点击登录按钮"
    }
  ]
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "网页数据采集流程",
    "description": "自动登录并采集数据",
    "steps": [...],
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 获取工作流列表

**请求:**
```http
GET /workflows?page=1&limit=10&status=ready
```

**响应:**
```json
{
  "success": true,
  "data": {
    "workflows": [...],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 3. 生成脚本

**请求:**
```http
POST /workflows/:id/generate-script
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "script-uuid",
    "workflowId": "workflow-uuid",
    "name": "网页数据采集流程_1704067200000",
    "code": "const { chromium } = require('playwright')...",
    "language": "javascript",
    "framework": "playwright",
    "filePath": "网页数据采集流程_1704067200000.js",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Script generated successfully"
}
```

## 脚本管理 (Scripts)

### 1. 获取脚本列表

**请求:**
```http
GET /scripts?page=1&limit=10&status=validated
```

**响应:**
```json
{
  "success": true,
  "data": {
    "scripts": [
      {
        "id": "uuid",
        "workflowId": "workflow-uuid",
        "name": "script_name",
        "language": "javascript",
        "framework": "playwright",
        "status": "validated",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

### 2. 下载脚本

**请求:**
```http
GET /scripts/:id/download
```

**响应:**
```
Content-Type: application/javascript
Content-Disposition: attachment; filename="script_name.js"

<script content>
```

### 3. 验证脚本

**请求:**
```http
POST /scripts/:id/validate
Content-Type: application/json

{
  "testData": {
    "username": "test@example.com",
    "password": "test123"
  }
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "steps": [
      {
        "stepIndex": 1,
        "passed": true,
        "screenshotMatch": true,
        "matchScore": 0.95,
        "actualScreenshot": "./screenshots/step_1.png"
      }
    ],
    "totalSteps": 5,
    "passedSteps": 5,
    "failedSteps": 0,
    "executionTime": 15420
  }
}
```

## 执行管理 (Executions)

### 1. 执行脚本

**请求:**
```http
POST /executions
Content-Type: application/json

{
  "scriptId": "script-uuid",
  "parameters": {
    "username": "user@example.com",
    "password": "password123"
  }
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "execution-uuid",
    "scriptId": "script-uuid",
    "status": "running",
    "startTime": "2024-01-01T00:00:00.000Z",
    "logs": []
  },
  "message": "Script execution started"
}
```

### 2. 获取执行日志

**请求:**
```http
GET /executions/:id/logs
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "level": "info",
      "message": "Browser launched"
    },
    {
      "timestamp": "2024-01-01T00:00:05.000Z",
      "level": "info",
      "message": "Navigated to https://example.com"
    }
  ]
}
```

### 3. 停止执行

**请求:**
```http
POST /executions/:id/stop
```

**响应:**
```json
{
  "success": true,
  "message": "Execution stopped successfully"
}
```

## 文件上传 (Uploads)

### 1. 上传视频

**请求:**
```http
POST /uploads/video
Content-Type: multipart/form-data

video: <file>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "type": "video",
    "originalName": "recording.mp4",
    "fileName": "uuid_recording.mp4",
    "url": "/uploads/videos/uuid_recording.mp4",
    "size": 10485760,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 上传截图

**请求:**
```http
POST /uploads/screenshot
Content-Type: multipart/form-data

screenshot: <file>
stepIndex: 1
stepDescription: "登录页面"
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "type": "screenshot",
    "url": "/uploads/screenshots/uuid.png",
    "metadata": {
      "stepIndex": 1,
      "stepDescription": "登录页面"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 批量上传截图

**请求:**
```http
POST /uploads/screenshots/batch
Content-Type: multipart/form-data

screenshots: <file1>
screenshots: <file2>
screenshots: <file3>
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "url": "/uploads/screenshots/uuid-1.png",
      "metadata": { "stepIndex": 1 }
    },
    {
      "id": "uuid-2",
      "url": "/uploads/screenshots/uuid-2.png",
      "metadata": { "stepIndex": 2 }
    }
  ]
}
```

## 错误响应

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": "Error message here"
}
```

常见HTTP状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误
