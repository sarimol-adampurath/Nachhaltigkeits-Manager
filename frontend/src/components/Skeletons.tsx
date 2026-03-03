export const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-shimmer"></div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Area Skeleton */}
      <div className="lg:col-span-4 h-64 bg-slate-200 rounded-2xl"></div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-8 space-y-4">
        {/* Chart Skeleton */}
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
        {/* List Skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);