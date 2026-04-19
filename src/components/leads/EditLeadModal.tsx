"use client";

import { LeadFormModal } from "@/components/leads/LeadFormModal";
import type { Lead, LeadUpdateRequest } from "@/types/lead";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

interface EditLeadModalProps {
  open: boolean;
  loading?: boolean;
  lead: Lead | null;
  users: User[];
  teams: SalesTeam[];
  tags: Lead["tags"];
  onClose: () => void;
  onSubmit: (payload: LeadUpdateRequest) => Promise<void>;
}

export const EditLeadModal = ({
  open,
  loading = false,
  lead,
  users,
  teams,
  tags,
  onClose,
  onSubmit,
}: EditLeadModalProps) => {
  return (
    <LeadFormModal
      open={open}
      mode="edit"
      loading={loading}
      users={users}
      teams={teams}
      tags={tags}
      initialLead={lead}
      onClose={onClose}
      onSubmit={(payload) => onSubmit(payload as LeadUpdateRequest)}
    />
  );
};
