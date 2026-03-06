import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { ExportButton } from './ExportButton';
import userEvent from '@testing-library/user-event';

// Mock fetch
vi.stubGlobal('fetch', vi.fn());

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', 'fake-token');
  });

  it('renders export button', () => {
    render(<ExportButton />);
    
    const button = screen.getByRole('button', { name: /export/i });
    expect(button).toBeInTheDocument();
  });

  it('shows menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButton />);
    
    const button = screen.getByRole('button', { name: /export/i });
    await user.click(button);
    
    expect(screen.getByText(/export as csv/i)).toBeInTheDocument();
    expect(screen.getByText(/export as pdf/i)).toBeInTheDocument();
  });

  it('calls export API when CSV is selected', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'attachment; filename="test.csv"',
      },
      blob: () => Promise.resolve(mockBlob),
    });

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    render(<ExportButton />);
    
    const button = screen.getByRole('button', { name: /export/i });
    await user.click(button);
    
    const csvButton = screen.getByText(/export as csv/i);
    await user.click(csvButton);
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/export/csv/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });
  });

  it('calls export API when PDF is selected', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'attachment; filename="test.pdf"',
      },
      blob: () => Promise.resolve(mockBlob),
    });

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    render(<ExportButton />);
    
    const button = screen.getByRole('button', { name: /export/i });
    await user.click(button);
    
    const pdfButton = screen.getByText(/export as pdf/i);
    await user.click(pdfButton);
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/export/pdf/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });
  });

  it('shows error message when export fails', async () => {
    const user = userEvent.setup();
    
    (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ExportButton />);
    
    const button = screen.getByRole('button', { name: /export/i });
    await user.click(button);
    
    const csvButton = screen.getByText(/export as csv/i);
    await user.click(csvButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('passes date filters to export API', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'attachment; filename="test.csv"',
      },
      blob: () => Promise.resolve(mockBlob),
    });

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    render(<ExportButton startDate="2026-01-01" endDate="2026-03-01" />);
    
    const button = screen.getByRole('button', { name: /export/i });
    await user.click(button);
    
    const csvButton = screen.getByText(/export as csv/i);
    await user.click(csvButton);
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2026-01-01'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2026-03-01'),
        expect.any(Object)
      );
    });
  });
});
