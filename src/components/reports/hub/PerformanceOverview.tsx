"use client";

interface PerformanceOverviewItem {
  label: string;
  value: string;
  subtext?: string;
}

interface PerformanceOverviewProps {
  items: PerformanceOverviewItem[];
}

export const PerformanceOverview = ({ items }: PerformanceOverviewProps) => {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-[#6C3FC5] to-[#8B5CF6] p-6 text-white shadow-sm">
      <h3 className="text-lg font-semibold">Performance Overview</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.label}>
            <p className="text-sm text-white/70">{item.label}</p>
            <p className="mt-1 text-3xl font-bold">{item.value}</p>
            {item.subtext ? <p className="mt-1 text-xs text-white/70">{item.subtext}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
};
