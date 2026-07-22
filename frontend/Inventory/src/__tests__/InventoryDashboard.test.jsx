import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InventoryDashboard from '../components/InventoryDashboard';
import * as inventoryApi from '../services/inventoryApi';

const mockInventory = [
  { id: 'I-001', name: 'Coffee Beans', category: 'Beverage', inStock: 25, status: 'Good' },
  { id: 'I-002', name: 'Milk', category: 'Dairy', inStock: 5, status: 'Low' },
];

vi.mock('../services/inventoryApi', () => ({
  fetchInventory: vi.fn(),
  updateInventory: vi.fn(),
}));

describe('Inventory Dashboard (Ob2W1D1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inventoryApi.fetchInventory.mockResolvedValue(mockInventory);
  });

  test('renders sidebar with navigation links', () => {
    render(<InventoryDashboard />);
    
    // Check for sidebar brand
    expect(screen.getByText('Inventory Manager')).toBeInTheDocument();
    
    // Check for navigation links - use getAllByText and check length
    const inventoryLinks = screen.getAllByText('Inventory');
    expect(inventoryLinks.length).toBeGreaterThan(0);
    
    // Check for other navigation items - these are unique in the sidebar
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('renders inventory table with correct headers', async () => {
    render(<InventoryDashboard />);
    
    // Wait for loading to complete
    await waitFor(() => {
      const loadingElement = screen.queryByText('Loading inventory...');
      expect(loadingElement).not.toBeInTheDocument();
    });
    
    // Wait for table data to appear - wait for all items
    await waitFor(() => {
      expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });
    
    // Verify the table is rendering data correctly
    expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    
    // Check for categories - use getAllByText since they might appear multiple times
    const beverageElements = screen.getAllByText('Beverage');
    expect(beverageElements.length).toBeGreaterThan(0);
    
    const dairyElements = screen.getAllByText('Dairy');
    expect(dairyElements.length).toBeGreaterThan(0);
    
    // Check for specific headers - these are unique
    expect(screen.getByText('ITEM ID')).toBeInTheDocument();
    expect(screen.getByText('NAME')).toBeInTheDocument();
    expect(screen.getByText('CATEGORY')).toBeInTheDocument();
    expect(screen.getByText('IN STOCK')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
    expect(screen.getByText('ACTION')).toBeInTheDocument();
  });

  test('page layout has sidebar and main', async () => {
    render(<InventoryDashboard />);
    
    // Check for sidebar
    expect(screen.getByLabelText('sidebar')).toBeInTheDocument();
    
    // Check for main content
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for dashboard title
    expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
    
    // Wait for table data to load
    await waitFor(() => {
      expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });
    
    // Verify table exists by checking for data
    expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });
});