const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.FAILTWIN_WEB_URL || (process.env.FAILTWIN_STATIC_WEB ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:8081'),
    headless: true,
    trace: 'retain-on-failure',
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'mobile-375', use: { viewport: { width: 375, height: 812 } } },
    { name: 'mobile-430', use: { viewport: { width: 430, height: 932 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: process.env.FAILTWIN_WEB_URL ? undefined : {
    command: process.env.FAILTWIN_STATIC_WEB ? 'npm run serve:web' : 'npm run web -- --offline --port 8081 --max-workers 2',
    url: process.env.FAILTWIN_STATIC_WEB ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { EXPO_NO_TELEMETRY: '1', EXPO_PUBLIC_CROCHE_MODE: 'mock' },
  },
});
