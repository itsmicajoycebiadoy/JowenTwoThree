// src/__tests__/Modal.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Modal from '../components/Modal';

describe('Modal Component', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('renders title correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test Modal"
        footer={<div>Footer Content</div>}
      >
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    const footerElements = screen.queryByText('Footer Content');
    expect(footerElements).not.toBeInTheDocument();
  });

  it('has close button', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.getByTestId('modal-close-btn')).toBeInTheDocument();
  });

  it('has overlay', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });
});