import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachingIntake from './CoachingIntake';
import { supabase } from '@/integrations/supabase/client';
import '@testing-library/jest-dom';

// Mock matched media
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock element prototypes for Radix Tooltip / Dialogs
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  root: any = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

// Mock Supabase
const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        insert: mockInsert
      }))
    }
  };
});

// Mock Toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('CoachingIntake Component', () => {
  it('renders correctly and submits programmatically', async () => {
    render(
      <BrowserRouter>
        <CoachingIntake />
      </BrowserRouter>
    );

    // Verify main header
    expect(screen.getByText(/Pre-Discovery/i)).toBeInTheDocument();
    
    // Fill required fields
    const nameInput = screen.getByPlaceholderText('Jane Doe');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const emailInput = screen.getByPlaceholderText('jane@example.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Click submit
    const submitButton = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitButton);

    // Verify Supabase insert was called
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('coaching_intakes');
      expect(mockInsert).toHaveBeenCalled();
      
      const args = mockInsert.mock.calls[0][0];
      expect(args.full_name).toBe('Test User');
      expect(args.email).toBe('test@example.com');
    });

    console.log("Programmatic test: The form rendered properly, validated correctly, and submitted logic successfully.");
  });
});
