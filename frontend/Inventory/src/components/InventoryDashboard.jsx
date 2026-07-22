// src/components/InventoryDashboard.jsx
import React from 'react';
import Sidebar from './Sidebar';
import DashboardContainer from './DashboardContainer';

export default function InventoryDashboard() {
  return (
    <div className="app-root">
      <Sidebar />
      <main className="main-area" role="main">
        <DashboardContainer />
      </main>
    </div>
  );
}