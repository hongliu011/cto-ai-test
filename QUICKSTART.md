# 🚀 快速开始 - RPA智能脚本生成器

## 30秒快速体验

### 1. 打开应用
```bash
# 直接打开HTML文件
open index.html

# 或启动本地服务器
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

### 2. 创建第一个自动化脚本

**步骤1：填写项目信息**
- 项目名称：`我的第一个RPA脚本`
- 项目描述：`自动打开网页并截图`

**步骤2：添加步骤**

点击"+ 添加步骤"按钮，添加以下步骤：

**第1步：打开网页**
- 步骤名称：`打开百度首页`
- 操作类型：`打开网页`
- 目标URL：`https://www.baidu.com`
- 点击"保存步骤"

**第2步：等待加载**
- 步骤名称：`等待页面加载`
- 操作类型：`等待`
- 等待时间：`2`
- 点击"保存步骤"

**第3步：截图**
- 步骤名称：`保存首页截图`
- 操作类型：`截图`
- 保存路径：`baidu_homepage.png`
- 点击"保存步骤"

**步骤3：生成脚本**
- 点击"🚀 生成自动化脚本"按钮
- 等待3秒，脚本生成完成

**步骤4：下载脚本**
- 点击"下载脚本"按钮
- 保存为 `my_first_rpa.py`

**步骤5：运行脚本**
```bash
# 安装依赖（首次运行）
pip install selenium pillow pytesseract

# 运行脚本
python3 my_first_rpa.py
```

## 🎯 进阶示例：自动登录

### 配置步骤

1. **打开登录页**
   - 操作：打开网页
   - URL：`https://example.com/login`

2. **输入用户名**
   - 操作：输入文本
   - 选择器：`#username`
   - 值：`{{username}}`

3. **输入密码**
   - 操作：输入文本
   - 选择器：`#password`
   - 值：`{{password}}`

4. **点击登录**
   - 操作：点击元素
   - 选择器：`#login-button`

5. **等待跳转**
   - 操作：等待
   - 时间：`3`秒

6. **保存结果**
   - 操作：截图
   - 路径：`login_result.png`

### 配置测试数据

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### 生成并运行

1. 点击"生成自动化脚本"
2. 下载脚本
3. 修改测试数据为真实账号
4. 运行脚本

## 📚 获取元素选择器

### 方法1：Chrome开发者工具

1. 右键点击目标元素
2. 选择"检查"（Inspect）
3. 在Elements面板，右键点击HTML元素
4. Copy → Copy selector 或 Copy XPath

### 方法2：使用Console

在浏览器Console中测试选择器：
```javascript
// 测试CSS选择器
document.querySelector("#login-button")

// 测试XPath
$x("//button[@type='submit']")
```

## 🔧 环境配置

### Python环境

```bash
# 安装Python 3（如果未安装）
# macOS
brew install python3

# Ubuntu/Debian
sudo apt-get install python3 python3-pip

# 安装依赖
pip3 install selenium pillow pytesseract
```

### ChromeDriver

```bash
# macOS
brew install --cask google-chrome
brew install chromedriver

# Ubuntu/Debian
sudo apt-get install chromium-browser chromium-chromedriver

# Windows
# 下载ChromeDriver: https://chromedriver.chromium.org/
# 添加到PATH环境变量
```

### Tesseract OCR（用于OCR验证）

```bash
# macOS
brew install tesseract tesseract-lang

# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim

# Windows
# 下载安装包: https://github.com/UB-Mannheim/tesseract/wiki
```

## 💡 使用技巧

### 1. 调试技巧

在关键步骤后添加截图和等待：
```
步骤N: 点击提交按钮
步骤N+1: 等待 2 秒
步骤N+2: 截图 step_N_result.png
```

### 2. 处理动态内容

```
步骤1: 点击"加载更多"
步骤2: 等待 3 秒（等待内容加载）
步骤3: 继续操作
```

### 3. 使用变量

测试数据：
```json
{
  "base_url": "https://example.com",
  "keyword": "Python教程"
}
```

步骤配置：
```
打开网页 → {{base_url}}/search
输入文本 → #search-input → {{keyword}}
```

## ⚠️ 常见问题

### 问题1：脚本运行失败
**解决方案**：
- 检查ChromeDriver是否安装
- 确认Python依赖已安装
- 验证网络连接

### 问题2：找不到元素
**解决方案**：
- 验证选择器是否正确
- 在关键步骤前添加等待
- 使用更稳定的选择器（ID > Class > XPath）

### 问题3：页面加载慢
**解决方案**：
- 增加等待时间
- 使用显式等待而不是固定等待

## 📖 更多资源

- 📘 [完整使用指南](USAGE_GUIDE.md)
- 📗 [项目说明](README.md)
- 📙 [实现总结](IMPLEMENTATION_SUMMARY.md)

## 🎉 开始你的RPA之旅！

现在你已经掌握了基础使用方法，可以创建自己的自动化脚本了。

如有问题，请查阅详细文档或提交Issue。

**祝使用愉快！** 🚀
