// src/components/QuantityInput.jsx
import React from 'react';

export default function QuantityInput({ 
  value, 
  onChange, 
  min = 1, 
  max = 9999, 
  label = 'Quantity',
  disabled = false 
}) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div className="quantity-input-group" data-testid="quantity-input-group">
      <label className="form-label">{label}</label>
      <div className="quantity-controls">
        <button
          type="button"
          className="quantity-btn"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          data-testid="quantity-decrement"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          className="quantity-input"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          data-testid="quantity-input"
          aria-label={label}
        />
        <button
          type="button"
          className="quantity-btn"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          data-testid="quantity-increment"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}