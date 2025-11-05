# RPA智能脚本生成器

一个基于AI的RPA（机器人流程自动化）脚本生成器，帮助用户通过可视化配置自动生成Python自动化脚本，并支持OCR验证测试结果。

## 功能特性

### 🤖 智能脚本生成
- **可视化配置界面**：通过友好的界面配置自动化步骤，无需编写代码
- **AI驱动生成**：基于配置自动生成完整的Python Selenium自动化脚本
- **支持多种操作类型**：
  - 打开网页 (Navigate)
  - 点击元素 (Click)
  - 输入文本 (Input)
  - 选择下拉列表 (Select)
  - 等待 (Wait)
  - 截图 (Screenshot)
  - 滚动页面 (Scroll)
  - 鼠标悬停 (Hover)

### 📸 截图与OCR验证
- **参考截图上传**：为每个步骤上传参考截图
- **OCR自动验证**：运行脚本时自动进行OCR对比验证
- **相似度检测**：计算实际执行结果与参考截图的相似度
- **可视化结果展示**：清晰展示每个步骤的验证结果

### 🧪 测试数据配置
- **JSON格式测试数据**：支持配置测试数据（用户名、密码等）
- **数据格式验证**：自动验证JSON格式正确性
- **动态数据注入**：脚本中可使用 `{{变量名}}` 引用测试数据

### 📊 实时监控与日志
- **进度条显示**：实时显示脚本生成和测试执行进度
- **详细日志记录**：记录每个步骤的执行状态和结果
- **状态面板**：显示当前操作状态和结果反馈

### 💾 项目管理
- **项目保存**：将配置导出为JSON文件
- **脚本下载**：下载生成的Python脚本
- **脚本复制**：一键复制脚本到剪贴板
- **新建项目**：快速创建新的自动化项目

## 使用方式

### 快速开始

1. **克隆或下载本仓库**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **打开应用**
   - 双击打开 `index.html` 文件
   - 或使用本地服务器：
     ```bash
     python3 -m http.server 8000
     ```
     然后访问 `http://localhost:8000`

### 使用流程

1. **填写项目信息**
   - 输入项目名称（例如：自动填写表单）
   - 输入项目描述

2. **配置自动化步骤**
   - 点击"+ 添加步骤"按钮
   - 选择操作类型（打开网页、点击、输入等）
   - 填写目标元素选择器或URL
   - 上传该步骤的参考截图
   - 保存步骤

3. **配置测试数据**
   - 在测试数据区域输入JSON格式的测试数据
   - 例如：
     ```json
     {
       "username": "test_user",
       "password": "test123",
       "email": "test@example.com"
     }
     ```
   - 点击"验证数据格式"确保格式正确

4. **生成脚本**
   - 点击"🚀 生成自动化脚本"按钮
   - AI将自动生成完整的Python脚本
   - 脚本会显示在右侧预览区

5. **运行测试**
   - 点击"▶️ 运行测试"模拟执行脚本
   - 查看测试日志了解每步执行情况

6. **OCR验证**
   - 点击"🔍 OCR验证"进行截图对比
   - 系统会将实际执行截图与参考截图对比
   - 查看验证结果和相似度

7. **导出使用**
   - 点击"复制脚本"复制到剪贴板
   - 或点击"下载脚本"保存为.py文件
   - 在本地环境运行生成的脚本

## 生成的脚本特性

生成的Python脚本包含以下特性：

- ✅ 基于Selenium WebDriver
- ✅ 支持多种元素选择器（ID、Class、CSS、XPath）
- ✅ 内置等待机制，提高稳定性
- ✅ OCR验证功能（使用pytesseract）
- ✅ 完整的错误处理
- ✅ 详细的执行日志
- ✅ 自动截图功能
- ✅ 测试数据支持

## 环境要求

生成的脚本需要以下Python依赖：

```bash
pip install selenium
pip install pillow
pip install pytesseract
```

同时需要：
- Chrome浏览器
- ChromeDriver（与Chrome版本匹配）
- Tesseract OCR引擎（用于OCR验证）

## 技术栈

- **前端框架**：纯原生HTML5 + CSS3 + JavaScript
- **UI设计**：响应式布局，支持桌面和移动设备
- **脚本生成**：基于模板的Python代码生成
- **自动化框架**：Selenium WebDriver
- **OCR引擎**：Tesseract OCR

## 项目结构

```
.
├── index.html      # 主HTML文件，包含完整的UI界面
├── style.css       # 样式文件，响应式设计
├── app.js          # 核心JavaScript逻辑
└── README.md       # 项目文档
```

## 示例：创建一个登录自动化脚本

1. **项目信息**
   - 名称：自动登录测试
   - 描述：自动填写登录表单并提交

2. **配置步骤**
   - 步骤1：打开网页 → `https://example.com/login`
   - 步骤2：输入文本 → 选择器：`#username`，值：`{{username}}`
   - 步骤3：输入文本 → 选择器：`#password`，值：`{{password}}`
   - 步骤4：点击元素 → 选择器：`#login-button`
   - 步骤5：等待 → 2秒
   - 步骤6：截图 → `login_result.png`

3. **测试数据**
   ```json
   {
     "username": "test_user",
     "password": "test_password"
   }
   ```

4. 点击生成，获得完整的Python自动化脚本！

## 高级功能

### 动态数据引用

在输入值中使用 `{{变量名}}` 可以引用测试数据：

```
输入值：{{username}}
```

脚本会自动从测试数据中获取对应的值。

### 元素选择器支持

支持多种选择器格式：
- ID选择器：`#login-button`
- Class选择器：`.submit-btn`
- CSS选择器：`input[name="username"]`
- XPath：`//button[@type="submit"]`

### OCR验证原理

1. 脚本执行时自动截图
2. 使用Tesseract OCR提取页面文本
3. 与参考截图进行对比
4. 计算相似度并生成验证报告

## 注意事项

- 生成的脚本需要安装相应的Python依赖
- 确保ChromeDriver版本与Chrome浏览器版本匹配
- OCR验证需要安装Tesseract OCR引擎
- 元素选择器需要准确，建议使用浏览器开发者工具获取
- 上传的截图会转换为Base64存储在浏览器中

## 常见问题

**Q: 生成的脚本无法运行？**
A: 请检查是否已安装selenium、pillow、pytesseract等依赖，以及ChromeDriver是否正确配置。

**Q: 如何获取元素选择器？**
A: 在浏览器中右键点击元素 → 检查 → 复制选择器或XPath。

**Q: OCR验证失败怎么办？**
A: 确保已安装Tesseract OCR，并且参考截图清晰、与实际页面相似。

**Q: 可以导入之前的项目吗？**
A: 当前版本支持导出项目为JSON，后续版本将支持导入功能。

## 贡献与反馈

欢迎提交Issue和Pull Request！

## 许可证

MIT License

---

**RPA智能脚本生成器** - 让自动化触手可及 🚀
