// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Inventory Frontend UI
 *
 * The frontend fetches directly from Supabase (not the backend API).
 * We intercept Supabase REST API calls and return mock data so tests
 * run without a real database.
 */

const MOCK_SUPABASE_ITEMS = [
  {
    id: 'I-001',
    item_name: 'Coffee Beans',
    current_stock: 25,
    inventory_categories: { category_name: 'Beverage', name: 'Beverage' },
  },
  {
    id: 'I-002',
    item_name: 'Milk',
    current_stock: 10,
    inventory_categories: { category_name: 'Dairy', name: 'Dairy' },
  },
];

const MOCK_SUPABASE_RESPONSE = {
  url: /\/rest\/v1\/inventory_items/,
  response: MOCK_SUPABASE_ITEMS,
};

async function mockSupabase(page) {
  await page.route(MOCK_SUPABASE_RESPONSE.url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SUPABASE_RESPONSE.response),
    });
  });
}

test.describe('Inventory Frontend UI - E2E', () => {

  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the inventory dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inventory dashboard/i })).toBeVisible();
    await expect(page.getByRole('table', { name: /inventory-table/i })).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('aside[aria-label="sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('Inventory Manager')).toBeVisible();
    await expect(sidebar.getByText('Inventory', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Orders')).toBeVisible();
    await expect(sidebar.getByText('Reports')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();
  });

  test('should render table headers correctly', async ({ page }) => {
    const headers = page.getByRole('table', { name: /inventory-table/i }).locator('thead th');
    await expect(headers).toHaveText(['ITEM ID', 'NAME', 'CATEGORY', 'IN STOCK', 'STATUS', 'ACTION']);
  });

  test('should display inventory items in the table', async ({ page }) => {
    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).toBeVisible();
  });

  test('should display correct stock quantities', async ({ page }) => {
    const coffeeRow = page.getByRole('row').filter({ hasText: 'Coffee Beans' });
    await expect(coffeeRow.getByText('25')).toBeVisible();

    const milkRow = page.getByRole('row').filter({ hasText: 'Milk' });
    await expect(milkRow.getByText('10')).toBeVisible();
  });

  test('should display correct stock status badges', async ({ page }) => {
    const goodBadge = page.getByTestId('stock-badge-Good');
    await expect(goodBadge).toBeVisible();
    await expect(goodBadge).toHaveText('In Stock');

    const nearingBadge = page.getByTestId('stock-badge-NearingExpiration');
    await expect(nearingBadge).toBeVisible();
    await expect(nearingBadge).toHaveText('Expiring Soon');
  });

  test('should display category information', async ({ page }) => {
    const coffeeRow = page.getByRole('row').filter({ hasText: 'Coffee Beans' });
    await expect(coffeeRow.getByText('Beverage')).toBeVisible();

    const milkRow = page.getByRole('row').filter({ hasText: 'Milk' });
    await expect(milkRow.getByText('Dairy')).toBeVisible();
  });

  test('should search items by name', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('Coffee');
    await page.waitForTimeout(300);

    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();
  });

  test('should search items by ID', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('I-002');
    await page.waitForTimeout(300);

    await expect(page.getByText('Milk', { exact: true })).toBeVisible();
    await expect(page.getByText('Coffee Beans', { exact: true })).not.toBeVisible();
  });

  test('should clear search to show all items', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('Coffee');
    await page.waitForTimeout(300);
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();

    await searchInput.fill('');
    await page.waitForTimeout(300);
    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).toBeVisible();
  });

  test('should filter items by category', async ({ page }) => {
    const filterDropdown = page.getByTestId('filter-dropdown');

    await filterDropdown.selectOption('Beverage');
    await page.waitForTimeout(300);
    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();

    await filterDropdown.selectOption('Dairy');
    await page.waitForTimeout(300);
    await expect(page.getByText('Milk', { exact: true })).toBeVisible();
    await expect(page.getByText('Coffee Beans', { exact: true })).not.toBeVisible();
  });

  test('should reset filter to show all items', async ({ page }) => {
    const filterDropdown = page.getByTestId('filter-dropdown');

    await filterDropdown.selectOption('Beverage');
    await page.waitForTimeout(300);
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();

    await filterDropdown.selectOption('All Categories');
    await page.waitForTimeout(300);
    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).toBeVisible();
  });

  test('should combine search and category filter', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const filterDropdown = page.getByTestId('filter-dropdown');

    await filterDropdown.selectOption('Beverage');
    await searchInput.fill('Coffee');
    await page.waitForTimeout(300);

    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();

    await searchInput.fill('Milk');
    await page.waitForTimeout(300);
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Coffee Beans', { exact: true })).not.toBeVisible();
  });

  test('should show no items found message', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('NonExistentItemXYZ');
    await page.waitForTimeout(300);

    await expect(page.getByText('No items found')).toBeVisible();
  });

  test('should display edit buttons for each item', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: 'Edit' });
    await expect(editButtons).toHaveCount(2);

    for (const btn of await editButtons.all()) {
      await expect(btn).toBeEnabled();
    }
  });

  test('should open modal when clicking Edit', async ({ page }) => {
    const coffeeRow = page.getByRole('row').filter({ hasText: 'Coffee Beans' });
    await coffeeRow.getByRole('button', { name: 'Edit' }).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('item-name-display')).toHaveText('Coffee Beans');
    await expect(page.getByTestId('current-stock-display')).toContainText('25');
    await expect(page.getByTestId('reason-select')).toBeVisible();
  });

  test('should close modal on Cancel', async ({ page }) => {
    const coffeeRow = page.getByRole('row').filter({ hasText: 'Coffee Beans' });
    await coffeeRow.getByRole('button', { name: 'Edit' }).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    await page.getByTestId('form-cancel-btn').click();
    await expect(modal).not.toBeVisible();
  });

  test('should show low stock warning banner', async ({ page }) => {
    const banner = page.getByTestId('low-stock-banner');
    await expect(banner).toBeVisible();
  });

  test('should show alert count indicator', async ({ page }) => {
    const indicator = page.getByTestId('alert-count-indicator');
    await expect(indicator).toBeVisible();

    const badge = page.getByTestId('alert-badge');
    await expect(badge).toBeVisible();
  });

  test('should open alerts panel from banner', async ({ page }) => {
    await page.getByTestId('banner-view-alerts-btn').click();

    const panel = page.getByTestId('alert-panel');
    await expect(panel).toBeVisible();
    await expect(panel.getByText('Inventory Alerts')).toBeVisible();
  });

  test('should close alerts panel', async ({ page }) => {
    await page.getByTestId('banner-view-alerts-btn').click();
    const panel = page.getByTestId('alert-panel');
    await expect(panel).toBeVisible();

    await page.getByTestId('alert-panel-close-btn').click();
    await expect(panel).not.toBeVisible();
  });

  test('should verify row data matches mock items', async ({ page }) => {
    const rows = page.getByRole('table', { name: /inventory-table/i }).locator('tbody tr');

    const firstRow = rows.nth(0).locator('td');
    await expect(firstRow.nth(0)).toHaveText('I-001');
    await expect(firstRow.nth(1)).toHaveText('Coffee Beans');
    await expect(firstRow.nth(2)).toHaveText('Beverage');
    await expect(firstRow.nth(3)).toHaveText('25');

    const secondRow = rows.nth(1).locator('td');
    await expect(secondRow.nth(0)).toHaveText('I-002');
    await expect(secondRow.nth(1)).toHaveText('Milk');
    await expect(secondRow.nth(2)).toHaveText('Dairy');
    await expect(secondRow.nth(3)).toHaveText('10');
  });

  test('should maintain filter state when clearing search', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const filterDropdown = page.getByTestId('filter-dropdown');

    await filterDropdown.selectOption('Beverage');
    await searchInput.fill('Coffee');
    await page.waitForTimeout(300);

    await searchInput.fill('');
    await page.waitForTimeout(300);

    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).not.toBeVisible();
  });

  test('should reset search when changing filter to All Categories', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    const filterDropdown = page.getByTestId('filter-dropdown');

    await searchInput.fill('Milk');
    await page.waitForTimeout(300);
    await expect(page.getByText('Coffee Beans', { exact: true })).not.toBeVisible();

    await filterDropdown.selectOption('All Categories');
    await page.waitForTimeout(300);

    await expect(page.getByText('Coffee Beans', { exact: true })).toBeVisible();
    await expect(page.getByText('Milk', { exact: true })).toBeVisible();
  });

  test('should show notes textarea in modal', async ({ page }) => {
    const coffeeRow = page.getByRole('row').filter({ hasText: 'Coffee Beans' });
    await coffeeRow.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByTestId('notes-textarea')).toBeVisible();
  });

  test('should display correct number of table rows', async ({ page }) => {
    const rows = page.getByRole('table', { name: /inventory-table/i }).locator('tbody tr');
    await expect(rows).toHaveCount(2);
  });
});
