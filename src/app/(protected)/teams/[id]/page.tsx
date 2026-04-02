import { TeamDetailPage } from "@/components/teams/TeamDetailPage";

interface TeamDetailRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamDetailRoutePage({ params }: TeamDetailRoutePageProps) {
  const { id } = await params;

  return <TeamDetailPage teamId={id} />;
}
