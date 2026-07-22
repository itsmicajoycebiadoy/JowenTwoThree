// src/__tests__/InventoryAdjustmentForm.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InventoryAdjustmentForm from '../components/InventoryAdjustmentForm';

const mockItem = {
  id: 'I-001',
  name: 'Coffee Beans',
  inStock: 25,
  category: 'Beverage'
};

describe('InventoryAdjustmentForm Component', () => {
  it('renders form with item details', () => {
    render(
      <InventoryAdjustmentForm 
        isOpen={true} 
        onClose={() => {}} 
        item={mockItem} 
        onSubmit={() => {}} 
      />
    );
    
    expect(screen.getByTestId('item-name-display')).toHaveTextContent('Coffee Beans');
    expect(screen.getByTestId('current-stock-display')).toHaveTextContent('25 units');
  });

  it('requires adjustment reason before submission', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <InventoryAdjustmentForm 
        isOpen={true} 
        onClose={mockOnClose} 
        item={mockItem} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Submit without selecting reason
    const submitBtn = screen.getByTestId('form-submit-btn');
    await user.click(submitBtn);
    
    // Should show error message - use waitFor instead of findByTestId
    await waitFor(() => {
      const errorElement = screen.getByTestId('form-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Please select an adjustment reason');
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits adjustment with all form data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue();
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    
    render(
      <InventoryAdjustmentForm 
        isOpen={true} 
        onClose={mockOnClose} 
        item={mockItem} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Select reason
    const reasonSelect = screen.getByTestId('reason-select');
    await user.selectOptions(reasonSelect, 'Restock');
    
    // Submit
    const submitBtn = screen.getByTestId('form-submit-btn');
    await user.click(submitBtn);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 'I-001',
          itemName: 'Coffee Beans',
          quantity: 1,
          reason: 'Restock',
        })
      );
    });
  });

  it('allows adjusting quantity', async () => {
    const user = userEvent.setup();
    
    render(
      <InventoryAdjustmentForm 
        isOpen={true} 
        onClose={() => {}} 
        item={mockItem} 
        onSubmit={() => {}} 
      />
    );
    
    const incrementBtn = screen.getByTestId('quantity-increment');
    const quantityInput = screen.getByTestId('quantity-input');
    
    expect(quantityInput).toHaveValue(1);
    
    await user.click(incrementBtn);
    expect(quantityInput).toHaveValue(2);
  });

  it('shows error when quantity is zero', async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(
      <InventoryAdjustmentForm 
        isOpen={true} 
        onClose={() => {}} 
        item={mockItem} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Get the decrement button and click to set quantity to 0
    const decrementBtn = screen.getByTestId('quantity-decrement');
    await user.click(decrementBtn); // quantity goes from 1 to 0
    
    // Select reason
    const reasonSelect = screen.getByTestId('reason-select');
    await user.selectOptions(reasonSelect, 'Restock');
    
    // Submit
    const submitBtn = screen.getByTestId('form-submit-btn');
    await user.click(submitBtn);
    
    // Should show error
    await waitFor(() => {
      const errorElement = screen.getByTestId('form-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Quantity cannot be zero');
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});