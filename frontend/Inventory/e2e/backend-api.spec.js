// @ts-check
import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

test.describe('Inventory Backend API - E2E', () => {

  test.describe('GET /api/inventory', () => {

    test('should return all inventory items', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory`);
      expect(res.ok()).toBeTruthy();

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(2);

      const ids = body.data.map((item) => item.id);
      expect(ids).toContain('I-001');
      expect(ids).toContain('I-002');
    });

    test('should return items with required fields', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory`);
      const body = await res.json();

      for (const item of body.data) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('inStock');
        expect(item).toHaveProperty('status');
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.category).toBe('string');
        expect(typeof item.inStock).toBe('number');
      }
    });

    test('should compute correct status from inStock value', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory`);
      const body = await res.json();

      const coffee = body.data.find((i) => i.id === 'I-001');
      expect(coffee.status).toBe('Good');
      expect(coffee.inStock).toBe(25);

      const milk = body.data.find((i) => i.id === 'I-002');
      expect(milk.status).toBe('NearingExpiration');
      expect(milk.inStock).toBe(10);
    });

    test('should search inventory by name', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?q=Coffee`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].name).toBe('Coffee Beans');
    });

    test('should search inventory by ID', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?q=I-002`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].id).toBe('I-002');
      expect(body.data[0].name).toBe('Milk');
    });

    test('should filter inventory by category', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?category=Beverage`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].category).toBe('Beverage');
      expect(body.data[0].name).toBe('Coffee Beans');
    });

    test('should return Dairy items when filtering by Dairy', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?category=Dairy`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].category).toBe('Dairy');
      expect(body.data[0].name).toBe('Milk');
    });

    test('should combine search and category filter', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?q=Coffee&category=Beverage`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].name).toBe('Coffee Beans');
      expect(body.data[0].category).toBe('Beverage');
    });

    test('should return empty array when search has no matches', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?q=NonExistentItem`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    test('should return empty array when category filter has no matches', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?category=NonExistentCategory`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    test('should return all items when search and category do not match', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory?q=Milk&category=Beverage`);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  test.describe('PUT /api/inventory/:id', () => {

    test('should update inventory stock successfully', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/I-001`, {
        data: {
          quantity: 5,
          reason: 'Restock',
          notes: 'Weekly restock',
        },
      });

      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.data).toHaveProperty('id', 'I-001');
      expect(body.data.inStock).toBe(30);
      expect(body.data.status).toBe('Good');
    });

    test('should decrease stock with negative quantity', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/I-001`, {
        data: {
          quantity: -10,
          reason: 'Sale',
        },
      });

      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.data.inStock).toBe(20);
      expect(body.data.status).toBe('Good');
    });

    test('should return 404 for nonexistent item', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/NONEXISTENT`, {
        data: {
          quantity: 5,
          reason: 'Restock',
        },
      });

      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.error).toContain('not found');
    });

    test('should return 400 when quantity is missing', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/I-001`, {
        data: {
          reason: 'Restock',
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('quantity');
    });

    test('should return 400 when quantity is not a number', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/I-001`, {
        data: {
          quantity: 'abc',
          reason: 'Restock',
        },
      });

      expect(res.status()).toBe(400);
    });

    test('should return 400 when reason is missing', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/I-001`, {
        data: {
          quantity: 5,
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('reason');
    });

    test('should return 400 when reason is empty string', async ({ request }) => {
      const res = await request.put(`${API_BASE}/api/inventory/I-001`, {
        data: {
          quantity: 5,
          reason: '',
        },
      });

      expect(res.status()).toBe(400);
    });

    test('should persist stock changes across requests', async ({ request }) => {
      await request.put(`${API_BASE}/api/inventory/I-002`, {
        data: { quantity: 5, reason: 'Restock' },
      });

      const res = await request.get(`${API_BASE}/api/inventory?q=I-002`);
      const body = await res.json();
      expect(body.data[0].inStock).toBe(15);
    });
  });

  test.describe('GET /api/inventory/alerts', () => {

    test('should return alerts list', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory/alerts`);
      expect(res.ok()).toBeTruthy();

      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(3);
    });

    test('should return alerts with required fields', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory/alerts`);
      const body = await res.json();

      for (const alert of body.data) {
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('itemName');
        expect(alert).toHaveProperty('message');
      }
    });

    test('should include critical and warning severity levels', async ({ request }) => {
      const res = await request.get(`${API_BASE}/api/inventory/alerts`);
      const body = await res.json();

      const severities = body.data.map((a) => a.severity);
      expect(severities).toContain('critical');
      expect(severities).toContain('warning');
    });
  });

  test.describe('GET / (health check)', () => {

    test('should return ok status', async ({ request }) => {
      const res = await request.get(`${API_BASE}/`);
      expect(res.ok()).toBeTruthy();

      const body = await res.json();
      expect(body).toEqual({ status: 'ok' });
    });
  });
});
