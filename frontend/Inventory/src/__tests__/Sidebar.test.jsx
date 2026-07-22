import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from '../components/Sidebar'

describe('Sidebar Component', () => {
  it('renders the sidebar with correct aria-label', () => {
    render(<Sidebar />)
    const sidebar = screen.getByLabelText('sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('contains a navigation element', () => {
    render(<Sidebar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('renders the Inventory link', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /Inventory/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#inventory')
  })

  it('renders the Orders link', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /Orders/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#orders')
  })

  it('renders the Reports link', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /Reports/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#reports')
  })

  it('renders the Settings link', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /Settings/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#settings')
  })

  it('renders all navigation links in an unordered list', () => {
    render(<Sidebar />)
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(4)
  })
})

