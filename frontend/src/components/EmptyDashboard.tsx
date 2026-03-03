const EmptyDashboard = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
      <span className="text-3xl">🌱</span>
    </div>
    <h3 className="text-xl font-bold text-slate-800">No activities recorded yet</h3>
    <p className="text-slate-500 max-w-sm mt-2 mb-6">
      Your carbon footprint journey starts here. Log your first activity using the form to see your impact trends.
    </p>
    <div className="animate-bounce text-emerald-500">
      <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-5-5m0 0l5-5m-5 5h18" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-widest">Start here</span>
    </div>
  </div>
);

export default EmptyDashboard;