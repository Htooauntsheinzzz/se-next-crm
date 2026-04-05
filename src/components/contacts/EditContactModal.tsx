"use client";

import { ContactFormModal } from "@/components/contacts/ContactFormModal";
import type { Contact, ContactUpdateRequest, TagDto } from "@/types/contact";
import type { User } from "@/types/user";

interface EditContactModalProps {
  open: boolean;
  loading?: boolean;
  contact: Contact | null;
  users: User[];
  tags: TagDto[];
  companies: Contact[];
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
      initialContact={contact}
      onClose={onClose}
      onSubmit={(payload) => onSubmit(payload as ContactUpdateRequest)}
    />
  );
};
