export const ErrorState = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-3xl border border-red-100 text-center">
    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-bold text-red-800">Connection Interrupted</h3>
    <p className="text-red-600/70 max-w-xs mt-2 mb-6 text-sm">
      {message || "We're having trouble reaching the server. Please check your internet connection or backend status."}
    </p>
    <button 
      onClick={onRetry}
      className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
    >
      Try Again
    </button>
  </div>
);
