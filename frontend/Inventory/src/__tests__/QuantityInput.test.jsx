import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import QuantityInput from '../components/QuantityInput';

function ControlledQuantityInput({ initialValue, onChangeSpy, ...props }) {
  const [value, setValue] = useState(initialValue);
  const handleChange = (v) => {
    setValue(v);
    onChangeSpy(v);
  };
  return <QuantityInput value={value} onChange={handleChange} {...props} />;
}

describe('QuantityInput Component', () => {
  it('renders with initial value', () => {
    render(<QuantityInput value={5} onChange={() => {}} />);
    const input = screen.getByTestId('quantity-input');
    expect(input).toHaveValue(5);
  });

  it('calls onChange when input value changes', async () => {
    const mockOnChange = vi.fn();
    render(<QuantityInput value={5} onChange={mockOnChange} />);

    const input = screen.getByTestId('quantity-input');

    fireEvent.change(input, { target: { value: '10' } });

    expect(mockOnChange).toHaveBeenCalledWith(10);
  });

  it('increments value when increment button is clicked', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityInput value={5} onChange={mockOnChange} />);

    const incrementBtn = screen.getByTestId('quantity-increment');
    await user.click(incrementBtn);

    expect(mockOnChange).toHaveBeenCalledWith(6);
  });

  it('decrements value when decrement button is clicked', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityInput value={5} onChange={mockOnChange} />);

    const decrementBtn = screen.getByTestId('quantity-decrement');
    await user.click(decrementBtn);

    expect(mockOnChange).toHaveBeenCalledWith(4);
  });

  it('disables decrement button at minimum value', () => {
    const mockOnChange = vi.fn();
    render(<QuantityInput value={0} onChange={mockOnChange} min={0} />);
    const decrementBtn = screen.getByTestId('quantity-decrement');
    expect(decrementBtn).toBeDisabled();
  });

  it('disables increment button at maximum value', () => {
    const mockOnChange = vi.fn();
    render(<QuantityInput value={100} onChange={mockOnChange} max={100} />);
    const incrementBtn = screen.getByTestId('quantity-increment');
    expect(incrementBtn).toBeDisabled();
  });

  it('respects min and max constraints', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ControlledQuantityInput
        initialValue={9}
        onChangeSpy={mockOnChange}
        min={1}
        max={10}
      />
    );

    const incrementBtn = screen.getByTestId('quantity-increment');

    await user.click(incrementBtn);
    expect(mockOnChange).toHaveBeenCalledWith(10);

    await user.click(incrementBtn);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    const mockOnChange = vi.fn();
    render(<QuantityInput value={5} onChange={mockOnChange} />);

    const input = screen.getByTestId('quantity-input');
    const decrementBtn = screen.getByTestId('quantity-decrement');
    const incrementBtn = screen.getByTestId('quantity-increment');

    expect(input).toHaveAttribute('aria-label', 'Quantity');
    expect(decrementBtn).toHaveAttribute('aria-label', 'Decrease quantity');
    expect(incrementBtn).toHaveAttribute('aria-label', 'Increase quantity');
  });

  it('handles manual input correctly', () => {
    const mockOnChange = vi.fn();
    render(
      <ControlledQuantityInput
        initialValue={5}
        onChangeSpy={mockOnChange}
        min={1}
        max={20}
      />
    );

    const input = screen.getByTestId('quantity-input');

    fireEvent.change(input, { target: { value: '15' } });

    expect(mockOnChange).toHaveBeenCalledWith(15);
  });
});