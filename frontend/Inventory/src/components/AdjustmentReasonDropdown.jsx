// src/components/AdjustmentReasonDropdown.jsx
import React from 'react';

export const ADJUSTMENT_REASONS = [
  { value: '', label: 'Select reason...' },
  { value: 'Restock', label: 'Restock' },
  { value: 'Sale', label: 'Sale' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Return', label: 'Return' },
  { value: 'Inventory Count', label: 'Inventory Count' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Other', label: 'Other' },
];

export default function AdjustmentReasonDropdown({
  value,
  onChange,
  label = 'Adjustment Reason',
  disabled = false
}) {
  return (
    <div className="reason-dropdown-group" data-testid="reason-dropdown-group">
      <label htmlFor="reason-select" className="reason-label">
        {label}
      </label>
      <select
        id="reason-select"
        className="reason-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid="reason-select"
        aria-label="Select adjustment reason"
      >
        {ADJUSTMENT_REASONS.map((reason) => (
          <option key={reason.value} value={reason.value}>
            {reason.label}
          </option>
        ))}
      </select>
    </div>
  );
} 