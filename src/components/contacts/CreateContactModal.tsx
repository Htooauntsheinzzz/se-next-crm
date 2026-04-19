"use client";

import { ContactFormModal } from "@/components/contacts/ContactFormModal";
import type { Contact, ContactCreateRequest, TagDto } from "@/types/contact";
import type { User } from "@/types/user";
import type { SalesTeam } from "@/types/team";

interface CreateContactModalProps {
  open: boolean;
  loading?: boolean;
  users: User[];
  tags: TagDto[];
  companies: Contact[];
  teams: SalesTeam[];
  onClose: () => void;
  onSubmit: (payload: ContactCreateRequest) => Promise<void>;
}

export const CreateContactModal = ({
  open,
  loading = false,
  users,
  tags,
  companies,
  teams,
  onClose,
  onSubmit,
}: CreateContactModalProps) => {
  return (
    <ContactFormModal
      open={open}
      mode="create"
      loading={loading}
      users={users}
      tags={tags}
      companies={companies}
      teams={teams}
      onClose={onClose}
      onSubmit={(payload) => onSubmit(payload as ContactCreateRequest)}
    />
  );
};
