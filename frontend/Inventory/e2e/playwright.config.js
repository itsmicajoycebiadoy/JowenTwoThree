// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');
const BACKEND_DIR = resolve(PROJECT_ROOT, 'backend');
const INVENTORY_DIR = resolve(PROJECT_ROOT, 'frontend', 'Inventory');

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 5173;

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'backend-api',
      testMatch: '**/backend-api.spec.js',
    },
    {
      name: 'frontend-ui',
      testMatch: '**/inventory-ui.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: [
    {
      command: 'node src/server.js',
      cwd: BACKEND_DIR,
      port: BACKEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
    {
      command: 'npx vite --port ' + FRONTEND_PORT,
      cwd: INVENTORY_DIR,
      port: FRONTEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
      env: {
        VITE_SUPABASE_URL: 'http://localhost:54321',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'test-anon-key',
      },
    },
  ],
});
