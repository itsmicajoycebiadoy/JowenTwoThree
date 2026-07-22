import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AlertNotificationPanel from '../components/AlertNotificationPanel';

const mockAlerts = [
  {
    id: 'ALERT-001',
    itemId: 'I-002',
    itemName: 'Whole Milk',
    category: 'Dairy',
    currentStock: 5,
    threshold: 10,
    severity: 'critical',
    message: 'Whole Milk is running critically low',
    timestamp: new Date(Date.now() - 2 * 60000),
  },
  {
    id: 'ALERT-002',
    itemId: 'I-005',
    itemName: 'Cookies',
    category: 'Snacks',
    currentStock: 3,
    threshold: 15,
    severity: 'critical',
    message: 'Cookies stock is critically low',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'ALERT-003',
    itemId: 'I-003',
    itemName: 'Coffee Beans - Arabica',
    category: 'Beverage',
    currentStock: 2,
    threshold: 20,
    severity: 'warning',
    message: 'Coffee Beans - Arabica is running low',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
];

describe('AlertNotificationPanel - Ob2W3D1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AlertNotificationPanel isOpen={false} onClose={vi.fn()} alerts={mockAlerts} />
    );
    expect(container.querySelector('[data-testid="alert-panel"]')).not.toBeInTheDocument();
  });

  it('renders panel when isOpen is true', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    const panel = screen.getByTestId('alert-panel');
    expect(panel).toBeInTheDocument();
  });

  it('displays correct number of alerts in footer', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    expect(screen.getByText(/3 alerts requiring attention/i)).toBeInTheDocument();
  });

  it('displays singular form for single alert', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={[mockAlerts[0]]} />
    );
    expect(screen.getByText(/1 alert requiring attention/i)).toBeInTheDocument();
  });

  it('displays alert items with correct information', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    
    expect(screen.getByText('Whole Milk')).toBeInTheDocument();
    expect(screen.getByText('Cookies')).toBeInTheDocument();
    expect(screen.getByText('Coffee Beans - Arabica')).toBeInTheDocument();
    expect(screen.getByText(/Whole Milk is running critically low/i)).toBeInTheDocument();
    expect(screen.getByText(/Cookies stock is critically low/i)).toBeInTheDocument();
  });

  it('displays timestamps for alerts', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    // Use more specific regex patterns to avoid multiple matches
    expect(screen.getByText(/^2m ago$/i)).toBeInTheDocument();
    expect(screen.getByText(/^5m ago$/i)).toBeInTheDocument();
    expect(screen.getByText(/^15m ago$/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(
      <AlertNotificationPanel isOpen={true} onClose={mockOnClose} alerts={mockAlerts} />
    );
    const closeBtn = screen.getByTestId('alert-panel-close-btn');
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(
      <AlertNotificationPanel isOpen={true} onClose={mockOnClose} alerts={mockAlerts} />
    );
    const overlay = screen.getByTestId('alert-panel-overlay');
    await user.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close when panel content is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(
      <AlertNotificationPanel isOpen={true} onClose={mockOnClose} alerts={mockAlerts} />
    );
    const panel = screen.getByTestId('alert-panel');
    await user.click(panel);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    const panel = screen.getByTestId('alert-panel');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-modal', 'true');
  });

  it('displays alert severity badges', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    
    // Use getAllByText to find the emojis
    const criticalBadges = screen.getAllByText('🔴');
    const warningBadges = screen.getAllByText('🟡');
    
    expect(criticalBadges.length).toBeGreaterThan(0);
    expect(warningBadges.length).toBeGreaterThan(0);
  });

  it('displays item IDs for alerts', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    expect(screen.getByText('I-002')).toBeInTheDocument();
    expect(screen.getByText('I-005')).toBeInTheDocument();
    expect(screen.getByText('I-003')).toBeInTheDocument();
  });

  it('shows stock information with current and threshold values', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    expect(screen.getByText(/Current: 5 units/i)).toBeInTheDocument();
    expect(screen.getByText(/Threshold: 10 units/i)).toBeInTheDocument();
    expect(screen.getByText(/Current: 3 units/i)).toBeInTheDocument();
    expect(screen.getByText(/Threshold: 15 units/i)).toBeInTheDocument();
    expect(screen.getByText(/Current: 2 units/i)).toBeInTheDocument();
    expect(screen.getByText(/Threshold: 20 units/i)).toBeInTheDocument();
  });

  it('renders "Reorder Now" buttons for each alert', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    const reorderButtons = screen.getAllByText(/Reorder Now/i);
    expect(reorderButtons.length).toBe(3);
  });

  it('displays stock progress bars', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    const stockBars = screen.getAllByTestId(/alert-bar-ALERT-\d+/);
    expect(stockBars.length).toBe(3);
  });

  it('displays low stock banner with correct count', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    expect(screen.getByText(/3 items are low on stock/i)).toBeInTheDocument();
  });

  it('displays "View Alerts" button in banner', () => {
    render(
      <AlertNotificationPanel isOpen={true} onClose={vi.fn()} alerts={mockAlerts} />
    );
    const viewAlertsBtn = screen.getByTestId('banner-view-alerts-btn');
    expect(viewAlertsBtn).toBeInTheDocument();
    expect(viewAlertsBtn).toHaveTextContent(/View Alerts/i);
  });
});