import { ContactDetailPage } from "@/components/contacts/ContactDetailPage";

interface ContactDetailRoutePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailRoutePage({ params }: ContactDetailRoutePageProps) {
  const { id } = await params;
  const contactId = Number(id);

  return <ContactDetailPage contactId={Number.isFinite(contactId) ? contactId : 0} />;
}
