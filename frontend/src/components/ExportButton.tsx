import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ExportButtonProps {
  startDate?: string;
  endDate?: string;
}

export const ExportButton = ({ startDate, endDate }: ExportButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8000/api/export/${format}/?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `emissions_report_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (contentDisposition) {
        const filenamePart = contentDisposition.split('filename="')[1];
        if (filenamePart) {
          filename = filenamePart.replace('"', '');
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setShowMenu(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isLoading}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-all text-sm md:text-base border border-emerald-600 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {isLoading ? 'Exporting...' : 'Export'}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <button
            onClick={() => handleExport('csv')}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 font-medium text-slate-700 border-b border-slate-100 transition-colors disabled:opacity-50"
          >
            📊 Export as CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 font-medium text-slate-700 transition-colors disabled:opacity-50"
          >
            📄 Export as PDF
          </button>
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-48 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
};
