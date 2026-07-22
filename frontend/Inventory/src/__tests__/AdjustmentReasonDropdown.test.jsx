// src/__tests__/AdjustmentReasonDropdown.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AdjustmentReasonDropdown, { ADJUSTMENT_REASONS } from '../components/AdjustmentReasonDropdown';

describe('AdjustmentReasonDropdown Component', () => {
  it('renders all adjustment reason options', () => {
    const mockOnChange = vi.fn();
    render(<AdjustmentReasonDropdown value="" onChange={mockOnChange} />);
    
    ADJUSTMENT_REASONS.forEach((reason) => {
      expect(screen.getByText(reason.label)).toBeInTheDocument();
    });
  });

  it('displays default placeholder option', () => {
    const mockOnChange = vi.fn();
    render(<AdjustmentReasonDropdown value="" onChange={mockOnChange} />);
    expect(screen.getByText('Select reason...')).toBeInTheDocument();
  });

  it('calls onChange when a new reason is selected', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(<AdjustmentReasonDropdown value="" onChange={mockOnChange} />);
    
    const select = screen.getByTestId('reason-select');
    await user.selectOptions(select, 'Restock');
    
    expect(mockOnChange).toHaveBeenCalledWith('Restock');
  });

  it('includes all required adjustment reasons', () => {
    expect(ADJUSTMENT_REASONS).toContainEqual(expect.objectContaining({ value: 'Restock' }));
    expect(ADJUSTMENT_REASONS).toContainEqual(expect.objectContaining({ value: 'Damaged' }));
    expect(ADJUSTMENT_REASONS).toContainEqual(expect.objectContaining({ value: 'Expired' }));
  });

  it('has proper accessibility attributes', () => {
    const mockOnChange = vi.fn();
    render(<AdjustmentReasonDropdown value="" onChange={mockOnChange} />);
    const select = screen.getByTestId('reason-select');
    expect(select).toHaveAttribute('aria-label', 'Select adjustment reason');
  });
});