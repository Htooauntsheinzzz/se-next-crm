const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />
);

export const DashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBox key={index} className="h-28" />
        ))}
      </div>

      <SkeletonBox className="col-span-12 h-[320px] lg:col-span-8" />
      <SkeletonBox className="col-span-12 h-[320px] lg:col-span-4" />

      <SkeletonBox className="col-span-12 h-[300px] lg:col-span-6" />
      <SkeletonBox className="col-span-12 h-[300px] lg:col-span-6" />

      <SkeletonBox className="col-span-12 h-[300px] lg:col-span-4" />
      <SkeletonBox className="col-span-12 h-[300px] lg:col-span-4" />
      <SkeletonBox className="col-span-12 h-[300px] lg:col-span-4" />

      <SkeletonBox className="col-span-12 h-[340px]" />
    </div>
  );
};
