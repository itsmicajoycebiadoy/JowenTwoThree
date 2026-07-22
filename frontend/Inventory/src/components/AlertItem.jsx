// src/components/AlertItem.jsx
import React from 'react';

const styles = {
  alertItem: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '14px 16px',
    marginBottom: '12px',
    background: '#fafafa',
    transition: 'all 0.2s',
  },
  alertItemCritical: {
    borderLeft: '4px solid #dc3545',
    background: '#fff5f5',
  },
  alertItemWarning: {
    borderLeft: '4px solid #ffc107',
    background: '#fffbf0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  product: {
    fontWeight: 600,
    color: '#333',
    fontSize: '15px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
  },
  message: {
    margin: '6px 0 10px 0',
    fontSize: '14px',
    color: '#555',
  },
  details: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
  },
  detail: {
    display: 'flex',
    gap: '4px',
  },
  label: {
    fontWeight: 500,
    color: '#888',
  },
  value: {
    color: '#333',
  },
  stockInfo: {
    marginBottom: '10px',
  },
  stockBarContainer: {
    width: '100%',
  },
  stockBarLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  },
  currentStock: {
    fontWeight: 500,
  },
  stockBar: {
    width: '100%',
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  stockBarFillCritical: {
    background: '#dc3545',
  },
  stockBarFillWarning: {
    background: '#ffc107',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  actionBtn: {
    padding: '6px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
    transition: 'all 0.2s',
    background: '#007bff',
    color: 'white',
  },
};

export default function AlertItem({ alert }) {
  const formatTime = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(timestamp)) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const stockPercentage = Math.min((alert.currentStock / alert.threshold) * 100, 100);

  const getAlertStyle = () => {
    if (alert.severity === 'critical') {
      return { ...styles.alertItem, ...styles.alertItemCritical };
    }
    if (alert.severity === 'warning') {
      return { ...styles.alertItem, ...styles.alertItemWarning };
    }
    return styles.alertItem;
  };

  const getBarFillStyle = () => {
    if (alert.severity === 'critical') {
      return { ...styles.stockBarFill, ...styles.stockBarFillCritical };
    }
    return { ...styles.stockBarFill, ...styles.stockBarFillWarning };
  };

  return (
    <div
      style={getAlertStyle()}
      role="listitem"
      data-testid={`alert-item-${alert.id}`}
    >
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ fontSize: '16px' }}>
            {alert.severity === 'critical' ? '🔴' : '🟡'}
          </span>
          <span style={styles.product} data-testid={`alert-product-${alert.id}`}>
            {alert.itemName}
          </span>
        </div>
        <span style={styles.timestamp} data-testid={`alert-time-${alert.id}`}>
          {formatTime(alert.timestamp)}
        </span>
      </div>

      <p style={styles.message} data-testid={`alert-message-${alert.id}`}>
        {alert.message}
      </p>

      <div style={styles.details}>
        <div style={styles.detail}>
          <span style={styles.label}>Item ID:</span>
          <span style={styles.value} data-testid={`alert-itemid-${alert.id}`}>
            {alert.itemId}
          </span>
        </div>
        <div style={styles.detail}>
          <span style={styles.label}>Category:</span>
          <span style={styles.value} data-testid={`alert-category-${alert.id}`}>
            {alert.category || 'General'}
          </span>
        </div>
      </div>

      <div style={styles.stockInfo}>
        <div style={styles.stockBarContainer}>
          <div style={styles.stockBarLabel}>
            <span style={styles.currentStock} data-testid={`alert-current-${alert.id}`}>
              Current: {alert.currentStock} units
            </span>
            <span>
              Threshold: {alert.threshold} units
            </span>
          </div>
          <div style={styles.stockBar}>
            <div
              style={{
                ...getBarFillStyle(),
                width: `${stockPercentage}%`,
              }}
              data-testid={`alert-bar-${alert.id}`}
            />
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          style={styles.actionBtn}
          data-testid={`alert-reorder-${alert.id}`}
          aria-label={`Reorder ${alert.itemName}`}
        >
          Reorder Now
        </button>
      </div>
    </div>
  );
}