import { UserDetailPage } from "@/components/users/UserDetailPage";

interface UserDetailRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailRoutePage({ params }: UserDetailRoutePageProps) {
  const { id } = await params;

  return <UserDetailPage userId={id} />;
}
