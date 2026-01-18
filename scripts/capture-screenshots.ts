/**
 * Screenshot capture script for README documentation
 *
 * Usage:
 * 1. Start the dev server: pnpm dev
 * 2. Run this script: npx tsx scripts/capture-screenshots.ts
 */

import { chromium, type Page, type Browser } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:3001";
const SCREENSHOT_DIR = path.join(
  process.cwd(),
  "docs/assets/screenshots"
);

// Test account credentials
const TEST_ACCOUNT = {
  username: "admin",
  password: "password123",
};

// Screenshot configurations
const SCREENSHOTS = [
  {
    name: "dashboard",
    path: "/",
    description: "机队状态仪表板",
    width: 1200,
    height: 800,
    waitFor: 2000,
  },
  {
    name: "aircraft-detail",
    path: "/aircraft/1",
    description: "飞机详情页面",
    width: 1200,
    height: 800,
    waitFor: 2000,
  },
  {
    name: "work-orders",
    path: "/work-orders",
    description: "工单管理页面",
    width: 1200,
    height: 800,
    waitFor: 2000,
  },
  {
    name: "inventory",
    path: "/inventory",
    description: "库存管理页面",
    width: 1200,
    height: 800,
    waitFor: 2000,
  },
  {
    name: "maintenance-schedule",
    path: "/maintenance/schedules",
    description: "维保计划页面",
    width: 1200,
    height: 800,
    waitFor: 2000,
  },
];

async function waitForNetworkIdle(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // Ignore timeout, continue with screenshot
  }
}

async function login(page: Page): Promise<boolean> {
  console.log("🔐 Logging in...");

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });

    // Wait for login form
    await page.waitForSelector('input[type="text"], input[name="username"]', {
      timeout: 10000,
    });

    // Fill in credentials
    const usernameInput = page.locator(
      'input[type="text"], input[name="username"]'
    );
    const passwordInput = page.locator('input[type="password"]');

    await usernameInput.fill(TEST_ACCOUNT.username);
    await passwordInput.fill(TEST_ACCOUNT.password);

    // Click login button
    const loginButton = page.locator(
      'button[type="submit"], button:has-text("登录"), button:has-text("Login")'
    );
    await loginButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });

    console.log("✅ Login successful");
    return true;
  } catch (error) {
    console.error("❌ Login failed:", error);
    return false;
  }
}

async function captureScreenshot(
  page: Page,
  config: (typeof SCREENSHOTS)[0]
): Promise<boolean> {
  const { name, path: pagePath, description, width, height, waitFor } = config;
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);

  console.log(`📸 Capturing: ${description} (${name}.png)`);

  try {
    // Set viewport
    await page.setViewportSize({ width, height });

    // Navigate to page
    await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: "domcontentloaded" });

    // Wait for network to settle
    await waitForNetworkIdle(page);

    // Additional wait for animations/data loading
    if (waitFor) {
      await page.waitForTimeout(waitFor);
    }

    // Capture screenshot
    await page.screenshot({
      path: filePath,
      fullPage: false,
    });

    console.log(`   ✅ Saved: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting screenshot capture...\n");
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📁 Output: ${SCREENSHOT_DIR}\n`);

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  let browser: Browser | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      locale: "zh-CN",
      colorScheme: "light",
    });

    const page = await context.newPage();

    // Login first
    const loginSuccess = await login(page);
    if (!loginSuccess) {
      console.error(
        "\n❌ Cannot proceed without login. Make sure the dev server is running."
      );
      process.exit(1);
    }

    console.log("\n📷 Capturing screenshots...\n");

    // Capture each screenshot
    let successCount = 0;
    let failCount = 0;

    for (const config of SCREENSHOTS) {
      const success = await captureScreenshot(page, config);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log(`📊 Summary: ${successCount} succeeded, ${failCount} failed`);
    console.log("=".repeat(50));

    if (failCount === 0) {
      console.log("\n✅ All screenshots captured successfully!");
      console.log(`\n📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    } else {
      console.log("\n⚠️  Some screenshots failed to capture.");
    }
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
