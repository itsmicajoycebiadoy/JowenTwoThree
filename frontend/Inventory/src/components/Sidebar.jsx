import React from 'react'

const navItems = [
  { href: '#inventory', label: 'Inventory'},
  { href: '#orders', label: 'Orders'},
  { href: '#reports', label: 'Reports'},
  { href: '#settings', label: 'Settings'},
]

export default function Sidebar({ activePage = 'inventory' }){
  return (
    <aside className="sidebar" aria-label="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-text">Inventory Manager</span>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`sidebar-link ${activePage === item.label.toLowerCase() ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
