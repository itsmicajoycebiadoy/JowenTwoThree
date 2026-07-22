// src/components/AlertNotificationPanel.jsx
import React from 'react';
import AlertList from './AlertList';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '24px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  titleText: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0 8px',
  },
  banner: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  bannerText: {
    flex: 1,
    fontWeight: 500,
    color: '#856404',
    fontSize: '14px',
  },
  bannerBtn: {
    background: '#ffc107',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#333',
    fontSize: '13px',
  },
  body: {
    marginBottom: '16px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  footer: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '12px',
  },
  count: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
};

export default function AlertNotificationPanel({ isOpen, onClose, alerts }) {
  if (!isOpen) return null;

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="presentation"
      data-testid="alert-panel-overlay"
    >
      <div
        style={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Inventory alerts panel"
        aria-modal="true"
        data-testid="alert-panel"
      >
        <div style={styles.header}>
          <div style={styles.title}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            <h2 style={styles.titleText}>Inventory Alerts</h2>
          </div>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close alerts panel"
            data-testid="alert-panel-close-btn"
          >
            ✕
          </button>
        </div>

        <div style={styles.banner} data-testid="low-stock-banner">
          <div style={styles.bannerContent}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <span style={styles.bannerText}>
              {alerts.length} items are low on stock
            </span>
            <button 
              style={styles.bannerBtn}
              data-testid="banner-view-alerts-btn"
            >
              View Alerts
            </button>
          </div>
        </div>

        <div style={styles.body}>
          <AlertList alerts={alerts} />
        </div>

        <div style={styles.footer}>
          <p style={styles.count}>
            {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} requiring attention
          </p>
        </div>
      </div>
    </div>
  );
}