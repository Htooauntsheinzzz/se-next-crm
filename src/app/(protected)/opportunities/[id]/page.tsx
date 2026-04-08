import { OpportunityDetailPage } from "@/components/opportunities/OpportunityDetailPage";

interface OpportunityDetailRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OpportunityDetailRoutePage({
  params,
}: OpportunityDetailRouteProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Invalid opportunity id.
      </div>
    );
  }

  return <OpportunityDetailPage id={numericId} />;
}
