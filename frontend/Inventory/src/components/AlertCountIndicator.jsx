// src/components/AlertCountIndicator.jsx
import React from 'react';

const styles = {
  button: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    fontSize: '20px',
    borderRadius: '50%',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 600,
    minWidth: '18px',
    textAlign: 'center',
    lineHeight: '14px',
  },
  unread: {
    animation: 'pulse 2s infinite',
  },
};

export default function AlertCountIndicator({ count, onClick, hasUnread = false }) {
  const buttonStyle = {
    ...styles.button,
    ...(hasUnread ? styles.unread : {}),
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      aria-label={`${count} inventory alert${count !== 1 ? 's' : ''}`}
      data-testid="alert-count-indicator"
      title={`${count} alert${count !== 1 ? 's' : ''} requiring attention`}
    >
      <span>🔔</span>
      {count > 0 && (
        <span
          style={styles.badge}
          data-testid="alert-badge"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}