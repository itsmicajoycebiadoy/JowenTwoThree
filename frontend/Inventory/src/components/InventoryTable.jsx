// src/components/InventoryTable.jsx
import React, { useState, useEffect } from 'react';
import * as inventoryApi from '../services/inventoryApi';

export default function InventoryTable({ inventory: propInventory }) {
  const [inventory, setInventory] = useState(propInventory || []);
  const [loading, setLoading] = useState(!propInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!propInventory) {
      loadInventory();
    } else {
      setInventory(propInventory);
    }
  }, [propInventory]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.fetchInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    if (!inventory || inventory.length === 0) return ['All Categories'];
    const categories = new Set(inventory.map(item => item.category));
    return ['All Categories', ...Array.from(categories)];
  };

  const getStatus = (item) => {
    if (item.inStock <= 5) return 'Low Stock';
    if (item.inStock <= 10) return 'Expiring Soon';
    return 'In Stock';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Low Stock': return '#FF0000';
      case 'Expiring Soon': return '#FFC107';
      default: return '#4CAF50';
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = () => {
    // Save logic here
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || 
                           selectedCategory === '' || 
                           item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div data-testid="inventory-loading">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="controls-section" data-testid="controls-section">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          data-testid="search-input"
          aria-label="Search inventory items"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-dropdown"
          data-testid="filter-dropdown"
          aria-label="Filter by category"
        >
          {getCategories().map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table role="table" aria-label="inventory-table">
          <thead>
            <tr>
              <th>ITEM ID</th>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>IN STOCK</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No items found
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => {
                const status = getStatus(item);
                const statusKey = status === 'In Stock' ? 'Good' : 
                                 status === 'Low Stock' ? 'Low' : 
                                 'NearingExpiration';
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.inStock}</td>
                    <td>
                      <span
                        className="stock-badge"
                        data-testid={`stock-badge-${statusKey}`}
                        style={{
                          backgroundColor: getStatusColor(status),
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-block',
                        }}
                        title={`Status: ${status}, Stock: ${item.inStock}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div data-testid="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h2>Adjust Inventory</h2>
            <div>
              <p><strong>Item:</strong> <span data-testid="item-name-display">{selectedItem.name}</span></p>
              <p><strong>Current Stock:</strong> <span data-testid="current-stock-display">{selectedItem.inStock} units</span></p>
              <div style={{ marginTop: '16px' }}>
                <label>Reason:</label>
                <select data-testid="reason-select" style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                  <option value="">Select reason</option>
                  <option value="sale">Sale</option>
                  <option value="restock">Restock</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label>Notes:</label>
                <textarea data-testid="notes-textarea" style={{ width: '100%', padding: '8px', marginTop: '4px' }} rows="3" />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                data-testid="form-cancel-btn"
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button 
                data-testid="form-save-btn"
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}