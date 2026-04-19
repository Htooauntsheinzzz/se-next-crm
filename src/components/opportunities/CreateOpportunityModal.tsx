"use client";

import { OpportunityFormModal } from "@/components/opportunities/OpportunityFormModal";
import type {
  OpportunityCreateRequest,
  OpportunityUpdateRequest,
} from "@/types/opportunity";
import type { PipelineStageDto } from "@/types/pipeline";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";
import type { TagDto } from "@/types/contact";

interface CreateOpportunityModalProps {
  open: boolean;
  loading?: boolean;
  stages: PipelineStageDto[];
  users: User[];
  teams: SalesTeam[];
  tags: TagDto[];
  forcedStageId?: number;
  onClose: () => void;
  onSubmit: (payload: OpportunityCreateRequest | OpportunityUpdateRequest) => Promise<void>;
}

export const CreateOpportunityModal = ({
  open,
  loading = false,
  stages,
  users,
  teams,
  tags,
  forcedStageId,
  onClose,
  onSubmit,
}: CreateOpportunityModalProps) => (
  <OpportunityFormModal
    open={open}
    mode="create"
    loading={loading}
    stages={stages}
    users={users}
    teams={teams}
    tags={tags}
    forcedStageId={forcedStageId}
    onClose={onClose}
    onSubmit={onSubmit}
  />
);
