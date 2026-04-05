"use client";

import { LeadFormModal } from "@/components/leads/LeadFormModal";
import type { Lead, LeadCreateRequest } from "@/types/lead";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

interface CreateLeadModalProps {
  open: boolean;
  loading?: boolean;
  users: User[];
  teams: SalesTeam[];
  tags: Lead["tags"];
  onClose: () => void;
  onSubmit: (payload: LeadCreateRequest) => Promise<void>;
}

export const CreateLeadModal = ({
  open,
  loading = false,
  users,
  teams,
  tags,
  onClose,
  onSubmit,
}: CreateLeadModalProps) => {
  return (
    <LeadFormModal
      open={open}
      mode="create"
      loading={loading}
      users={users}
      teams={teams}
      tags={tags}
      onClose={onClose}
      onSubmit={(payload) => onSubmit(payload as LeadCreateRequest)}
    />
  );
};
