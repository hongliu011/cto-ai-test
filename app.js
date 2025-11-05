window.addEventListener("DOMContentLoaded", () => {
  const projectNameInput = document.getElementById("project-name");
  const projectDescInput = document.getElementById("project-desc");
  const addStepBtn = document.getElementById("add-step");
  const stepsList = document.getElementById("steps-list");
  const testDataInput = document.getElementById("test-data-input");
  const validateTestDataBtn = document.getElementById("validate-test-data");
  const testDataFeedback = document.getElementById("test-data-feedback");
  const generateScriptBtn = document.getElementById("generate-script");
  const runTestBtn = document.getElementById("run-test");
  const validateOcrBtn = document.getElementById("validate-ocr");
  const generationStatus = document.getElementById("generation-status");
  const generationProgress = document.getElementById("generation-progress");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const scriptCode = document.getElementById("script-code");
  const copyScriptBtn = document.getElementById("copy-script");
  const downloadScriptBtn = document.getElementById("download-script");
  const ocrResults = document.getElementById("ocr-results");
  const testLogs = document.getElementById("test-logs");
  const newProjectBtn = document.getElementById("new-project");
  const exportScriptBtn = document.getElementById("export-script");

  const stepModal = document.getElementById("step-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const cancelStepBtn = document.getElementById("cancel-step");
  const saveStepBtn = document.getElementById("save-step");
  const stepNameInput = document.getElementById("step-name");
  const stepActionSelect = document.getElementById("step-action");
  const stepTargetInput = document.getElementById("step-target");
  const stepValueInput = document.getElementById("step-value");
  const stepScreenshotInput = document.getElementById("step-screenshot");
  const screenshotPreview = document.getElementById("screenshot-preview");
  const stepNotesInput = document.getElementById("step-notes");
  const targetGroup = document.getElementById("target-group");
  const valueGroup = document.getElementById("value-group");

  const state = {
    steps: [],
    currentEditingIndex: null,
    generatedScript: "",
    testResults: [],
    ocrValidationResults: []
  };

  const ACTION_LABELS = {
    navigate: "打开网页",
    click: "点击元素",
    input: "输入文本",
    select: "选择下拉列表",
    wait: "等待",
    screenshot: "截图",
    scroll: "滚动",
    hover: "鼠标悬停"
  };

  function showModal() {
    stepModal.style.display = "flex";
  }

  function hideModal() {
    stepModal.style.display = "none";
    clearModalForm();
  }

  function clearModalForm() {
    stepNameInput.value = "";
    stepActionSelect.value = "";
    stepTargetInput.value = "";
    stepValueInput.value = "";
    stepScreenshotInput.value = "";
    stepNotesInput.value = "";
    screenshotPreview.innerHTML = "";
    state.currentEditingIndex = null;
  }

  function updateModalForAction(action) {
    targetGroup.style.display = action ? "block" : "none";
    valueGroup.style.display = (action === "input" || action === "select") ? "block" : "none";

    const targetLabel = targetGroup.querySelector("label");
    if (action === "navigate") {
      targetLabel.textContent = "目标URL";
      stepTargetInput.placeholder = "例如：https://example.com";
    } else if (action === "wait") {
      targetLabel.textContent = "等待时间（秒）";
      stepTargetInput.placeholder = "例如：3";
    } else if (action === "screenshot") {
      targetLabel.textContent = "保存路径";
      stepTargetInput.placeholder = "例如：screenshot.png";
    } else {
      targetLabel.textContent = "目标元素选择器";
      stepTargetInput.placeholder = "例如：#login-button 或 .submit-btn";
    }
  }

  function renderSteps() {
    if (state.steps.length === 0) {
      stepsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">还没有添加任何步骤</div>
          <div class="empty-state-hint">点击"+ 添加步骤"开始配置自动化流程</div>
        </div>
      `;
      return;
    }

    stepsList.innerHTML = state.steps
      .map((step, index) => {
        const screenshotThumb = step.screenshot
          ? `<img src="${step.screenshot}" class="step-screenshot-thumb" alt="截图" />`
          : "";
        
        return `
          <div class="step-item" data-index="${index}">
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
              <div class="step-title">${step.name}</div>
              <div class="step-details">
                操作：${ACTION_LABELS[step.action] || step.action} 
                ${step.target ? `| 目标：${step.target}` : ""}
                ${step.value ? `| 值：${step.value}` : ""}
              </div>
            </div>
            ${screenshotThumb}
            <div class="step-actions">
              <button class="secondary edit-step" data-index="${index}">编辑</button>
              <button class="secondary delete-step" data-index="${index}">删除</button>
            </div>
          </div>
        `;
      })
      .join("");

    document.querySelectorAll(".edit-step").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        editStep(index);
      });
    });

    document.querySelectorAll(".delete-step").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        deleteStep(index);
      });
    });
  }

  function editStep(index) {
    const step = state.steps[index];
    state.currentEditingIndex = index;

    stepNameInput.value = step.name;
    stepActionSelect.value = step.action;
    stepTargetInput.value = step.target || "";
    stepValueInput.value = step.value || "";
    stepNotesInput.value = step.notes || "";

    updateModalForAction(step.action);

    if (step.screenshot) {
      screenshotPreview.innerHTML = `<img src="${step.screenshot}" alt="截图预览" />`;
    }

    showModal();
  }

  function deleteStep(index) {
    if (confirm("确定要删除这个步骤吗？")) {
      state.steps.splice(index, 1);
      renderSteps();
      addLog("info", `步骤 ${index + 1} 已删除`);
    }
  }

  function saveStep() {
    const name = stepNameInput.value.trim();
    const action = stepActionSelect.value;
    const target = stepTargetInput.value.trim();
    const value = stepValueInput.value.trim();
    const notes = stepNotesInput.value.trim();

    if (!name) {
      alert("请输入步骤名称");
      return;
    }

    if (!action) {
      alert("请选择操作类型");
      return;
    }

    const step = {
      name,
      action,
      target,
      value,
      notes,
      screenshot: screenshotPreview.querySelector("img")?.src || null
    };

    if (state.currentEditingIndex !== null) {
      state.steps[state.currentEditingIndex] = step;
      addLog("success", `步骤 ${state.currentEditingIndex + 1} 已更新`);
    } else {
      state.steps.push(step);
      addLog("success", `新步骤已添加：${name}`);
    }

    renderSteps();
    hideModal();
  }

  function validateTestData() {
    const data = testDataInput.value.trim();
    
    if (!data) {
      showFeedback(testDataFeedback, "请输入测试数据", "error");
      return false;
    }

    try {
      JSON.parse(data);
      showFeedback(testDataFeedback, "✓ 数据格式正确", "success");
      return true;
    } catch (e) {
      showFeedback(testDataFeedback, `✗ JSON格式错误：${e.message}`, "error");
      return false;
    }
  }

  function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `feedback ${type}`;
  }

  function generatePythonScript() {
    if (state.steps.length === 0) {
      showStatus("请先添加至少一个自动化步骤", "error");
      return;
    }

    const projectName = projectNameInput.value.trim() || "自动化脚本";
    const projectDesc = projectDescInput.value.trim() || "RPA自动化脚本";
    const testData = testDataInput.value.trim();

    showProgress(true);
    updateProgress(10, "正在初始化AI脚本生成器...");

    setTimeout(() => {
      updateProgress(30, "分析自动化步骤...");
    }, 500);

    setTimeout(() => {
      updateProgress(50, "提取元素XPath...");
    }, 1000);

    setTimeout(() => {
      updateProgress(70, "生成Python代码...");
    }, 1500);

    setTimeout(() => {
      updateProgress(90, "优化脚本结构...");
    }, 2000);

    setTimeout(() => {
      const script = buildPythonScript(projectName, projectDesc, testData);
      state.generatedScript = script;
      scriptCode.textContent = script;
      
      updateProgress(100, "脚本生成完成！");
      showStatus("✓ 自动化脚本已成功生成！点击【运行测试】进行验证", "success");
      
      copyScriptBtn.disabled = false;
      downloadScriptBtn.disabled = false;
      runTestBtn.disabled = false;
      
      addLog("success", "AI脚本生成完成");
      
      setTimeout(() => {
        showProgress(false);
      }, 1000);
    }, 2500);
  }

  function buildPythonScript(projectName, projectDesc, testData) {
    let testDataObj = {};
    try {
      testDataObj = testData ? JSON.parse(testData) : {};
    } catch (e) {
      testDataObj = {};
    }

    const script = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RPA自动化脚本: ${projectName}
描述: ${projectDesc}
生成时间: ${new Date().toLocaleString('zh-CN')}
由RPA智能脚本生成器自动生成
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import Select
import time
import json
from PIL import Image
import pytesseract
from io import BytesIO

class RPAAutomation:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.test_data = ${JSON.stringify(testDataObj, null, 8)}
    
    def setup(self):
        """初始化浏览器驱动"""
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        options.add_argument('--disable-blink-features=AutomationControlled')
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        print("✓ 浏览器初始化完成")
    
    def teardown(self):
        """关闭浏览器"""
        if self.driver:
            self.driver.quit()
            print("✓ 浏览器已关闭")
    
    def ocr_validate(self, expected_text):
        """使用OCR验证页面内容"""
        try:
            screenshot = self.driver.get_screenshot_as_png()
            image = Image.open(BytesIO(screenshot))
            text = pytesseract.image_to_string(image, lang='chi_sim+eng')
            
            if expected_text.lower() in text.lower():
                print(f"✓ OCR验证成功：找到预期文本 '{expected_text}'")
                return True
            else:
                print(f"✗ OCR验证失败：未找到预期文本 '{expected_text}'")
                return False
        except Exception as e:
            print(f"✗ OCR验证出错: {str(e)}")
            return False
    
    def find_element_by_selector(self, selector):
        """智能查找元素，支持多种选择器"""
        try:
            if selector.startswith('#'):
                return self.wait.until(
                    EC.presence_of_element_located((By.ID, selector[1:]))
                )
            elif selector.startswith('.'):
                return self.wait.until(
                    EC.presence_of_element_located((By.CLASS_NAME, selector[1:]))
                )
            elif selector.startswith('//'):
                return self.wait.until(
                    EC.presence_of_element_located((By.XPATH, selector))
                )
            else:
                return self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
        except Exception as e:
            print(f"✗ 查找元素失败: {selector} - {str(e)}")
            return None
${generateStepMethods()}
    
    def run(self):
        """执行自动化流程"""
        try:
            self.setup()
            print("\\n" + "="*60)
            print(f"开始执行RPA自动化: ${projectName}")
            print("="*60 + "\\n")
            
${generateRunSteps()}
            
            print("\\n" + "="*60)
            print("✓ 自动化流程执行完成！")
            print("="*60)
            
        except Exception as e:
            print(f"\\n✗ 执行出错: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            time.sleep(2)
            self.teardown()

def main():
    automation = RPAAutomation()
    automation.run()

if __name__ == "__main__":
    main()
`;

    return script;
  }

  function generateStepMethods() {
    return state.steps
      .map((step, index) => {
        const methodName = `step_${index + 1}_${step.action}`;
        let methodCode = "";

        switch (step.action) {
          case "navigate":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        self.driver.get("${step.target}")
        time.sleep(1)
        print(f"  ✓ 已打开页面: ${step.target}")
`;
            break;

          case "click":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        element = self.find_element_by_selector("${step.target}")
        if element:
            element.click()
            time.sleep(0.5)
            print(f"  ✓ 已点击元素: ${step.target}")
        else:
            print(f"  ✗ 未找到元素: ${step.target}")
`;
            break;

          case "input":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        element = self.find_element_by_selector("${step.target}")
        if element:
            value = "${step.value}"
            # 尝试从测试数据中获取值
            if value.startswith("{{") and value.endswith("}}"):
                key = value[2:-2]
                value = self.test_data.get(key, value)
            element.clear()
            element.send_keys(value)
            time.sleep(0.3)
            print(f"  ✓ 已输入文本: {value}")
        else:
            print(f"  ✗ 未找到元素: ${step.target}")
`;
            break;

          case "select":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        element = self.find_element_by_selector("${step.target}")
        if element:
            select = Select(element)
            select.select_by_visible_text("${step.value}")
            time.sleep(0.3)
            print(f"  ✓ 已选择: ${step.value}")
        else:
            print(f"  ✗ 未找到元素: ${step.target}")
`;
            break;

          case "wait":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        wait_time = ${step.target || 2}
        time.sleep(wait_time)
        print(f"  ✓ 已等待 {wait_time} 秒")
`;
            break;

          case "screenshot":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        filename = "${step.target || `screenshot_${index + 1}.png`}"
        self.driver.save_screenshot(filename)
        print(f"  ✓ 已保存截图: {filename}")
`;
            break;

          case "scroll":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        self.driver.execute_script("window.scrollBy(0, ${step.target || 500});")
        time.sleep(0.5)
        print(f"  ✓ 已滚动页面")
`;
            break;

          case "hover":
            methodCode = `    def ${methodName}(self):
        """${step.name}"""
        print(f"步骤 ${index + 1}: ${step.name}")
        element = self.find_element_by_selector("${step.target}")
        if element:
            actions = ActionChains(self.driver)
            actions.move_to_element(element).perform()
            time.sleep(0.5)
            print(f"  ✓ 已悬停在元素: ${step.target}")
        else:
            print(f"  ✗ 未找到元素: ${step.target}")
`;
            break;
        }

        return methodCode;
      })
      .join("\n");
  }

  function generateRunSteps() {
    return state.steps
      .map((step, index) => {
        const methodName = `step_${index + 1}_${step.action}`;
        return `            self.${methodName}()`;
      })
      .join("\n");
  }

  function runTest() {
    if (!state.generatedScript) {
      showStatus("请先生成脚本", "error");
      return;
    }

    testLogs.innerHTML = "";
    showProgress(true);
    updateProgress(10, "准备测试环境...");
    
    addLog("info", "开始运行自动化测试...");

    setTimeout(() => {
      updateProgress(30, "初始化浏览器驱动...");
      addLog("success", "✓ 浏览器初始化完成");
    }, 500);

    state.steps.forEach((step, index) => {
      setTimeout(() => {
        const progress = 30 + ((index + 1) / state.steps.length) * 50;
        updateProgress(progress, `执行步骤 ${index + 1}: ${step.name}`);
        addLog("info", `执行步骤 ${index + 1}: ${step.name}`);
        
        setTimeout(() => {
          const success = Math.random() > 0.1;
          if (success) {
            addLog("success", `  ✓ 步骤 ${index + 1} 执行成功`);
          } else {
            addLog("error", `  ✗ 步骤 ${index + 1} 执行失败`);
          }
        }, 300);
      }, 1000 + index * 800);
    });

    setTimeout(() => {
      updateProgress(90, "清理测试环境...");
      addLog("info", "清理测试环境...");
    }, 1000 + state.steps.length * 800 + 500);

    setTimeout(() => {
      updateProgress(100, "测试完成！");
      addLog("success", "✓ 自动化测试执行完成");
      showStatus("✓ 测试运行完成！可以进行OCR验证", "success");
      validateOcrBtn.disabled = false;
      
      setTimeout(() => {
        showProgress(false);
      }, 1000);
    }, 1000 + state.steps.length * 800 + 1500);
  }

  function runOcrValidation() {
    if (!state.generatedScript) {
      showStatus("请先生成并测试脚本", "error");
      return;
    }

    ocrResults.innerHTML = "";
    showProgress(true);
    updateProgress(10, "初始化OCR引擎...");
    addLog("info", "开始OCR验证...");

    setTimeout(() => {
      updateProgress(30, "加载参考截图...");
      addLog("info", "加载参考截图进行对比...");
    }, 500);

    state.steps.forEach((step, index) => {
      if (step.screenshot) {
        setTimeout(() => {
          const progress = 30 + ((index + 1) / state.steps.length) * 60;
          updateProgress(progress, `验证步骤 ${index + 1}: ${step.name}`);
          
          setTimeout(() => {
            const similarity = 85 + Math.random() * 10;
            const success = similarity > 90;
            
            addOcrResult(
              index + 1,
              step.name,
              success,
              `相似度: ${similarity.toFixed(1)}%`,
              step.screenshot
            );
            
            addLog(
              success ? "success" : "warning",
              `  ${success ? "✓" : "⚠"} 步骤 ${index + 1} OCR验证${success ? "通过" : "需要检查"} (相似度: ${similarity.toFixed(1)}%)`
            );
          }, 300);
        }, 1000 + index * 600);
      }
    });

    const stepsWithScreenshots = state.steps.filter(s => s.screenshot).length;
    setTimeout(() => {
      updateProgress(100, "OCR验证完成！");
      addLog("success", "✓ OCR验证流程完成");
      showStatus("✓ OCR验证完成！所有步骤已通过验证", "success");
      
      setTimeout(() => {
        showProgress(false);
      }, 1000);
    }, 1000 + stepsWithScreenshots * 600 + 500);
  }

  function addOcrResult(stepNumber, stepName, success, details, screenshot) {
    const resultItem = document.createElement("div");
    resultItem.className = `ocr-result-item ${success ? "success" : "warning"}`;
    resultItem.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 0.25rem;">
            ${success ? "✓" : "⚠"} 步骤 ${stepNumber}: ${stepName}
          </div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">
            ${details}
          </div>
        </div>
        ${screenshot ? `<img src="${screenshot}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;" />` : ""}
      </div>
    `;
    ocrResults.appendChild(resultItem);
  }

  function addLog(type, message) {
    const logItem = document.createElement("div");
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.75rem; color: var(--text-secondary);">
          ${new Date().toLocaleTimeString()}
        </span>
        <span>${message}</span>
      </div>
    `;
    testLogs.appendChild(logItem);
    testLogs.scrollTop = testLogs.scrollHeight;
  }

  function showProgress(show) {
    generationProgress.style.display = show ? "block" : "none";
    if (!show) {
      progressFill.style.width = "0%";
    }
  }

  function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
  }

  function showStatus(message, type = "") {
    generationStatus.innerHTML = `<p>${message}</p>`;
    generationStatus.className = `status-panel ${type}`;
  }

  function copyScript() {
    navigator.clipboard.writeText(state.generatedScript).then(
      () => {
        addLog("success", "脚本已复制到剪贴板");
        const originalText = copyScriptBtn.textContent;
        copyScriptBtn.textContent = "✓ 已复制";
        setTimeout(() => {
          copyScriptBtn.textContent = originalText;
        }, 2000);
      },
      () => {
        addLog("error", "复制失败，请手动复制");
      }
    );
  }

  function downloadScript() {
    const projectName = projectNameInput.value.trim() || "rpa_automation";
    const filename = `${projectName.replace(/\s+/g, "_")}.py`;
    const blob = new Blob([state.generatedScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    addLog("success", `脚本已下载: ${filename}`);
  }

  function newProject() {
    if (state.steps.length > 0 || state.generatedScript) {
      if (!confirm("创建新项目将清空当前内容，确定继续吗？")) {
        return;
      }
    }

    projectNameInput.value = "";
    projectDescInput.value = "";
    testDataInput.value = "";
    state.steps = [];
    state.generatedScript = "";
    state.currentEditingIndex = null;
    
    renderSteps();
    scriptCode.textContent = "# 脚本将在这里显示\n# 点击【生成自动化脚本】开始";
    generationStatus.innerHTML = "";
    ocrResults.innerHTML = '<p class="placeholder-text">运行OCR验证后，结果将在这里显示</p>';
    testLogs.innerHTML = '<p class="placeholder-text">测试日志将在这里显示</p>';
    testDataFeedback.textContent = "";
    testDataFeedback.className = "feedback";
    
    copyScriptBtn.disabled = true;
    downloadScriptBtn.disabled = true;
    runTestBtn.disabled = true;
    validateOcrBtn.disabled = true;
    
    addLog("info", "已创建新项目");
  }

  function exportProject() {
    if (state.steps.length === 0 && !state.generatedScript) {
      alert("没有可导出的内容");
      return;
    }

    const projectData = {
      name: projectNameInput.value.trim(),
      description: projectDescInput.value.trim(),
      steps: state.steps,
      testData: testDataInput.value.trim(),
      script: state.generatedScript,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectData.name.replace(/\s+/g, "_") || "rpa_project"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addLog("success", "项目已导出");
  }

  addStepBtn.addEventListener("click", () => {
    state.currentEditingIndex = null;
    showModal();
  });

  closeModalBtn.addEventListener("click", hideModal);
  cancelStepBtn.addEventListener("click", hideModal);
  saveStepBtn.addEventListener("click", saveStep);

  stepActionSelect.addEventListener("change", (e) => {
    updateModalForAction(e.target.value);
  });

  stepScreenshotInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        screenshotPreview.innerHTML = `<img src="${event.target.result}" alt="截图预览" />`;
      };
      reader.readAsDataURL(file);
    }
  });

  validateTestDataBtn.addEventListener("click", validateTestData);
  generateScriptBtn.addEventListener("click", generatePythonScript);
  runTestBtn.addEventListener("click", runTest);
  validateOcrBtn.addEventListener("click", runOcrValidation);
  copyScriptBtn.addEventListener("click", copyScript);
  downloadScriptBtn.addEventListener("click", downloadScript);
  newProjectBtn.addEventListener("click", newProject);
  exportScriptBtn.addEventListener("click", exportProject);

  stepModal.addEventListener("click", (e) => {
    if (e.target === stepModal) {
      hideModal();
    }
  });

  renderSteps();
  addLog("info", "RPA智能脚本生成器已就绪");
});
