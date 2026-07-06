const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  reporter: 'html',
  retries: process.env.CI ? 2 : 0,
  use: {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'es-MX',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    
    //USER AGENT
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--no-sandbox'
      ],
    },
  },
});