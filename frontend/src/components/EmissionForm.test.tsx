import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { EmissionForm } from './EmissionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hooks
vi.mock('../hooks/useEmission', () => ({
  useEmission: () => ({
    addLog: vi.fn(),
    isAdding: false,
  }),
}));

// Mock the emission service
vi.mock('../api/emissionServices', () => ({
  emissionService: {
    getFactors: vi.fn(() => Promise.resolve([
      { id: 1, category: 'Electricity', unit: 'kWh', factor: 0.328 },
      { id: 2, category: 'Natural Gas', unit: 'm3', factor: 2.02 },
    ])),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('EmissionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <EmissionForm />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/log new activity/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add log/i })).toBeInTheDocument();
  });

  it('loads categories on mount', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <EmissionForm />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('shows validation error when submitting empty form', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <EmissionForm />
      </QueryClientProvider>
    );
    
    const submitButton = screen.getByRole('button', { name: /add log/i });
    submitButton.click();
    
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/required/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});
