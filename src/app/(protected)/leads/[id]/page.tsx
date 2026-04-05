interface LeadDetailRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailRoutePage({ params }: LeadDetailRoutePageProps) {
  const { id } = await params;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Lead Detail</h1>
      <p className="mt-2 text-sm text-slate-500">
        Lead detail page for ID: <span className="font-medium text-slate-700">{id}</span>
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Full lead detail view can be added here when required.
      </p>
    </div>
  );
}
