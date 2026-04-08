"use client";

import { OpportunityFormModal } from "@/components/opportunities/OpportunityFormModal";
import type {
  Opportunity,
  OpportunityCreateRequest,
  OpportunityUpdateRequest,
} from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import type { TagDto } from "@/types/contact";

interface EditOpportunityModalProps {
  open: boolean;
  loading?: boolean;
  opportunity: Opportunity | null;
  stages: PipelineStageDto[];
  users: User[];
  teams: SalesTeam[];
  tags: TagDto[];
  onClose: () => void;
  onSubmit: (payload: OpportunityCreateRequest | OpportunityUpdateRequest) => Promise<void>;
}

export const EditOpportunityModal = ({
  open,
  loading = false,
  opportunity,
  stages,
  users,
  teams,
  tags,
  onClose,
  onSubmit,
}: EditOpportunityModalProps) => (
  <OpportunityFormModal
    open={open}
    mode="edit"
    loading={loading}
    stages={stages}
    users={users}
    teams={teams}
    tags={tags}
    initialOpportunity={opportunity}
    onClose={onClose}
    onSubmit={onSubmit}
  />
);
