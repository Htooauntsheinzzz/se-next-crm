import { LeadDetailPage } from "@/components/leads/LeadDetailPage";

interface LeadDetailRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailRoutePage({ params }: LeadDetailRoutePageProps) {
  const { id } = await params;
  const numericId = Number(id);

  return <LeadDetailPage leadId={Number.isFinite(numericId) ? numericId : 0} />;
}
