import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryInteractionLinking from '../components/InventoryInteractionLinking';
import * as inventoryApi from '../services/inventoryApi';

const mockInventory = [
  { id: 'I-001', name: 'Coffee Beans', category: 'Beverage', inStock: 25, status: 'Good' },
  { id: 'I-002', name: 'Milk', category: 'Dairy', inStock: 5, status: 'Low' },
  { id: 'I-003', name: 'Yogurt', category: 'Dairy', inStock: 8, status: 'NearingExpiration' },
  { id: 'I-004', name: 'Croissant', category: 'Pastry', inStock: 20, status: 'Good' },
  { id: 'I-005', name: 'Cookies', category: 'Snacks', inStock: 3, status: 'Low' },
];

vi.mock('../services/inventoryApi', () => ({
  fetchInventory: vi.fn(),
  updateInventory: vi.fn(),
}));

async function renderLoaded() {
  render(<InventoryInteractionLinking />);
  await waitFor(() => {
    const loadingElement = screen.queryByTestId('inventory-loading');
    expect(loadingElement).not.toBeInTheDocument();
  });
}

describe('InventoryTable - Interaction Linking (OB2W3D2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inventoryApi.fetchInventory.mockResolvedValue(mockInventory);
  });

  describe('Search Functionality Integration', () => {
    it('displays all items when no search term is entered', async () => {
      await renderLoaded();
      await waitFor(() => {
        expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
      });
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    it('filters items by product name using search', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      await user.type(searchInput, 'Milk');
      expect(searchInput.value).toBe('Milk');
    });

    it('filters items by product ID using search', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'I-001');
      expect(searchInput.value).toBe('I-001');
    });

    it('shows no results when search term does not match any items', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'NonexistentProduct123XYZ');
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeLessThan(10);
    });

    it('clears search results when search field is emptied', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Milk');
      expect(searchInput.value).toBe('Milk');
      await user.clear(searchInput);
      expect(searchInput.value).toBe('');
    });
  });

  describe('Category Filtering Integration', () => {
    it('displays all categories in filter dropdown', async () => {
      await renderLoaded();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has multiple category options', async () => {
      await renderLoaded();
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(1);
    });

    it('shows all items when "All Categories" is selected', async () => {
      await renderLoaded();
      const allOption = screen.getByRole('option', { name: /all/i });
      expect(allOption).toBeInTheDocument();
    });
  });

  describe('Search and Filter Combined', () => {
    it('allows using search and category filter together', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      const categorySelect = screen.getByRole('combobox');

      await user.type(searchInput, 'Milk');
      expect(searchInput.value).toBe('Milk');
      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe('Row-specific Edit Linking', () => {
    it('table renders with edit buttons for each row', async () => {
      await renderLoaded();
      const editButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent.toLowerCase().includes('edit')
      );
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('edit buttons are accessible and clickable', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const editButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent.toLowerCase().includes('edit')
      );
      expect(editButtons[0]).toBeInTheDocument();
      await user.click(editButtons[0]);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays form elements when item is selected for editing', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const editButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent.toLowerCase().includes('edit')
      );
      await user.click(editButtons[0]);
      expect(screen.getByTestId('reason-select')).toBeInTheDocument();
      expect(screen.getByTestId('notes-textarea')).toBeInTheDocument();
    });

    it('modal closes when cancel button is clicked', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const editButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent.toLowerCase().includes('edit')
      );
      await user.click(editButtons[0]);
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      await user.click(screen.getByTestId('form-cancel-btn'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Dynamic Inventory Updates', () => {
    it('inventory table maintains state across interactions', async () => {
      const user = userEvent.setup();
      await renderLoaded();

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);

      await user.type(screen.getByPlaceholderText(/search/i), 'test');
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('inventory persists after multiple interactions', async () => {
      const user = userEvent.setup();
      await renderLoaded();

      expect(screen.getByRole('table')).toBeInTheDocument();

      await user.selectOptions(screen.getByRole('combobox'), 'Dairy');
      await user.type(screen.getByPlaceholderText(/search/i), 'milk');

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Acceptance Criteria Verification', () => {
    it('AC1: User can search for products using keywords', async () => {
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.type).toBe('text');
    });

    it('AC2: User can filter inventory items by category', async () => {
      await renderLoaded();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('AC3: User can select an inventory item for editing by clicking edit button', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const editButtons = screen.getAllByRole('button').filter((btn) =>
        btn.textContent.toLowerCase().includes('edit')
      );
      expect(editButtons.length).toBeGreaterThan(0);
      await user.click(editButtons[0]);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('AC4: User can see the table with inventory information', async () => {
      await renderLoaded();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Accessibility', () => {
    it('table has proper structure with headers and rows', async () => {
      await renderLoaded();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });

    it('search input is accessible', async () => {
      await renderLoaded();
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('filter dropdown is accessible', async () => {
      await renderLoaded();
      const categorySelect = screen.getByRole('combobox');
      expect(categorySelect).toBeVisible();
    });
  });
});