"use client";

import { ContactFormModal } from "@/components/contacts/ContactFormModal";
import type { Contact, ContactCreateRequest, TagDto } from "@/types/contact";
import type { User } from "@/types/user";

interface CreateContactModalProps {
  open: boolean;
  loading?: boolean;
  users: User[];
  tags: TagDto[];
  companies: Contact[];
  onClose: () => void;
  onSubmit: (payload: ContactCreateRequest) => Promise<void>;
}

export const CreateContactModal = ({
  open,
  loading = false,
  users,
  tags,
  companies,
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
      onClose={onClose}
      onSubmit={(payload) => onSubmit(payload as ContactCreateRequest)}
    />
  );
};
