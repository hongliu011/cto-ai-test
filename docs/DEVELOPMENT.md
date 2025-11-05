# 开发指南

## 环境准备

### 系统要求
- Node.js >= 18.0.0
- Docker & Docker Compose
- Python 3.8+ (用于OCR服务)
- Git

### IDE推荐
- Visual Studio Code
- WebStorm
- 推荐插件:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd rpa-ai-platform
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有子项目依赖
npm run install:all
```

### 3. 配置环境变量

创建 `server/.env` 文件：

```bash
cp server/.env.example server/.env
```

编辑 `.env` 文件，填入必要的配置：
- OpenAI API Key (开发测试用)
- 数据库配置
- Redis配置

### 4. 启动开发服务器

#### 方式一：本地开发

```bash
# 启动后端服务 (端口: 3001)
cd server
npm run dev

# 新终端窗口，启动前端服务 (端口: 3000)
cd client
npm start
```

#### 方式二：Docker开发环境

```bash
# 启动所有服务
npm run docker:up

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### 5. 访问应用

- 前端: http://localhost:3000
- 后端API: http://localhost:3001/api/v1
- 健康检查: http://localhost:3001/health

## 项目结构

```
rpa-ai-platform/
├── client/                 # React前端
│   ├── public/
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── stores/        # 状态管理
│   │   ├── utils/         # 工具函数
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── server/                # Node.js后端
│   ├── src/
│   │   ├── controllers/   # 控制器层
│   │   ├── services/      # 业务逻辑层
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由配置
│   │   ├── middlewares/   # 中间件
│   │   ├── utils/         # 工具函数
│   │   └── index.ts
│   └── package.json
├── docker/                # Docker配置
├── docs/                  # 文档
└── docker-compose.yml
```

## 开发规范

### 代码风格

#### TypeScript规范
- 使用严格模式 (`strict: true`)
- 优先使用接口 (interface) 而非类型别名 (type)
- 为函数参数和返回值添加类型注解

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  // ...
}

// Avoid
type User = {
  id: string;
  name: string;
};

function getUser(id) {
  // ...
}
```

#### 命名约定
- 文件名: kebab-case (`workflow-service.ts`)
- 类名: PascalCase (`WorkflowService`)
- 函数名: camelCase (`createWorkflow`)
- 常量: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Git提交规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型 (type):
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链更新

示例:
```
feat(workflow): add video upload support

- Implement multer middleware for video uploads
- Add video processing service
- Update workflow model to include videoUrl

Closes #123
```

### API设计规范

1. **RESTful风格**: 使用标准HTTP方法
2. **统一响应格式**:
   ```json
   {
     "success": true,
     "data": {},
     "message": ""
   }
   ```
3. **错误处理**: 使用合适的HTTP状态码
4. **分页**: 使用 `page` 和 `limit` 参数
5. **过滤**: 使用query参数进行过滤

### 错误处理

#### 后端错误处理

```typescript
import { AppError } from './middlewares/errorHandler';

// 业务错误
throw new AppError('Workflow not found', 404);

// 未预期错误会被全局错误处理器捕获
```

#### 前端错误处理

```typescript
try {
  const response = await api.createWorkflow(data);
  message.success('创建成功');
} catch (error) {
  message.error(error.message || '创建失败');
}
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定文件的测试
npm test -- workflow.service.test.ts

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

### 测试规范

```typescript
describe('WorkflowService', () => {
  let workflowService: WorkflowService;

  beforeEach(() => {
    workflowService = new WorkflowService();
  });

  describe('createWorkflow', () => {
    it('should create a workflow with valid data', async () => {
      const data = {
        name: 'Test Workflow',
        steps: []
      };
      
      const workflow = await workflowService.createWorkflow(data);
      
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');
    });

    it('should throw error with invalid data', async () => {
      await expect(
        workflowService.createWorkflow({})
      ).rejects.toThrow();
    });
  });
});
```

## 调试

### VS Code调试配置

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server",
      "console": "integratedTerminal"
    }
  ]
}
```

### 日志调试

```typescript
import logger from './utils/logger';

logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error });
```

## 数据库迁移

### 创建迁移

```bash
# 创建新的迁移文件
npm run migration:create -- add-workflow-table
```

### 运行迁移

```bash
# 运行所有待执行的迁移
npm run migration:run

# 回滚上一次迁移
npm run migration:revert
```

## 部署

### 构建生产版本

```bash
# 构建后端
cd server
npm run build

# 构建前端
cd client
npm run build
```

### Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 性能优化

### 后端优化
1. 使用Redis缓存频繁访问的数据
2. 实现数据库查询分页
3. 使用Bull队列处理耗时任务
4. 添加请求压缩中间件

### 前端优化
1. 使用React.lazy()进行代码分割
2. 实现虚拟滚动处理大列表
3. 使用useMemo和useCallback优化渲染
4. 图片懒加载

## 故障排查

### 常见问题

#### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

#### 2. 依赖安装失败

```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

#### 3. Docker容器无法启动

```bash
# 查看容器日志
docker-compose logs <service-name>

# 重新构建镜像
docker-compose build --no-cache
```

## 资源链接

- [Playwright文档](https://playwright.dev/)
- [React文档](https://react.dev/)
- [Ant Design文档](https://ant.design/)
- [Node.js最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript手册](https://www.typescriptlang.org/docs/)
