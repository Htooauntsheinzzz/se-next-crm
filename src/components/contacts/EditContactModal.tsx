"use client";

import { ContactFormModal } from "@/components/contacts/ContactFormModal";
import type { Contact, ContactUpdateRequest, TagDto } from "@/types/contact";
import type { User } from "@/types/user";
import type { SalesTeam } from "@/types/team";

interface EditContactModalProps {
  open: boolean;
  loading?: boolean;
  contact: Contact | null;
  users: User[];
  tags: TagDto[];
  companies: Contact[];
  teams: SalesTeam[];
  onClose: () => void;
  onSubmit: (payload: ContactUpdateRequest) => Promise<void>;
}

export const EditContactModal = ({
  open,
  loading = false,
  contact,
  users,
  tags,
  companies,
  teams,
  onClose,
  onSubmit,
}: EditContactModalProps) => {
  return (
    <ContactFormModal
      open={open}
      mode="edit"
      loading={loading}
      users={users}
      tags={tags}
      companies={companies}
      teams={teams}
      initialContact={contact}
      onClose={onClose}
      onSubmit={(payload) => onSubmit(payload as ContactUpdateRequest)}
    />
  );
};
