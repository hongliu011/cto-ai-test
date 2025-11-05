#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RPA自动化脚本示例
这是一个由RPA智能脚本生成器生成的示例脚本
展示了系统生成的Python自动化脚本的结构和功能
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
        self.test_data = {
            "username": "test_user",
            "password": "test123",
            "email": "test@example.com"
        }
    
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

    def step_1_navigate(self):
        """打开登录页面"""
        print(f"步骤 1: 打开登录页面")
        self.driver.get("https://example.com/login")
        time.sleep(1)
        print(f"  ✓ 已打开页面: https://example.com/login")

    def step_2_input(self):
        """输入用户名"""
        print(f"步骤 2: 输入用户名")
        element = self.find_element_by_selector("#username")
        if element:
            value = "{{username}}"
            if value.startswith("{{") and value.endswith("}}"):
                key = value[2:-2]
                value = self.test_data.get(key, value)
            element.clear()
            element.send_keys(value)
            time.sleep(0.3)
            print(f"  ✓ 已输入文本: {value}")
        else:
            print(f"  ✗ 未找到元素: #username")

    def step_3_input(self):
        """输入密码"""
        print(f"步骤 3: 输入密码")
        element = self.find_element_by_selector("#password")
        if element:
            value = "{{password}}"
            if value.startswith("{{") and value.endswith("}}"):
                key = value[2:-2]
                value = self.test_data.get(key, value)
            element.clear()
            element.send_keys(value)
            time.sleep(0.3)
            print(f"  ✓ 已输入文本: {value}")
        else:
            print(f"  ✗ 未找到元素: #password")

    def step_4_click(self):
        """点击登录按钮"""
        print(f"步骤 4: 点击登录按钮")
        element = self.find_element_by_selector("#login-button")
        if element:
            element.click()
            time.sleep(0.5)
            print(f"  ✓ 已点击元素: #login-button")
        else:
            print(f"  ✗ 未找到元素: #login-button")

    def step_5_wait(self):
        """等待页面加载"""
        print(f"步骤 5: 等待页面加载")
        wait_time = 2
        time.sleep(wait_time)
        print(f"  ✓ 已等待 {wait_time} 秒")

    def step_6_screenshot(self):
        """保存结果截图"""
        print(f"步骤 6: 保存结果截图")
        filename = "login_result.png"
        self.driver.save_screenshot(filename)
        print(f"  ✓ 已保存截图: {filename}")
    
    def run(self):
        """执行自动化流程"""
        try:
            self.setup()
            print("\n" + "="*60)
            print(f"开始执行RPA自动化: 自动登录测试")
            print("="*60 + "\n")
            
            self.step_1_navigate()
            self.step_2_input()
            self.step_3_input()
            self.step_4_click()
            self.step_5_wait()
            self.step_6_screenshot()
            
            print("\n" + "="*60)
            print("✓ 自动化流程执行完成！")
            print("="*60)
            
        except Exception as e:
            print(f"\n✗ 执行出错: {str(e)}")
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
