import React, { useState } from 'react';
import Modal from './Modal';
import QuantityInput from './QuantityInput';
import AdjustmentReasonDropdown from './AdjustmentReasonDropdown';

export default function InventoryAdjustmentForm({ isOpen, onClose, item, onSubmit }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (reason === '') {
      setError('Please select an adjustment reason');
      return;
    }

    if (quantity === 0) {
      setError('Quantity cannot be zero');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit({
        itemId: item.id,
        itemName: item.name,
        quantity,
        reason,
        notes,
        timestamp: new Date().toISOString(),
      });

      setSuccess(true);

      setTimeout(() => {
        handleReset();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to update inventory');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setQuantity(1);
    setReason('');
    setNotes('');
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Adjust Inventory">
      <form
        id="adjustment-form"
        className="adjustment-form"
        data-testid="adjustment-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label className="form-label">Item Name</label>
          <div className="form-value" data-testid="item-name-display">
            {item.name}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Current Stock</label>
          <div className="form-value" data-testid="current-stock-display">
            {item.inStock} units
          </div>
        </div>

        <div className="form-group">
          <QuantityInput
            value={quantity}
            onChange={setQuantity}
            min={0}
            max={9999}
            label="Adjustment Quantity"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <AdjustmentReasonDropdown
            value={reason}
            onChange={setReason}
            label="Adjustment Reason"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-textarea"
            data-testid="notes-textarea"
            placeholder="Add any additional notes..."
            rows="3"
            disabled={isSubmitting}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" data-testid="form-error" style={{ color: '#dc3545', marginTop: '10px' }}>
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message" data-testid="form-success" style={{ color: '#155724', marginTop: '10px' }}>
            ✅ Inventory updated successfully!
          </div>
        )}

        {/* Form Actions - INSIDE the form */}
        <div className="form-actions" data-testid="form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            data-testid="form-cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="form-submit-btn"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Updating...' : success ? '✅ Updated!' : 'Confirm Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}