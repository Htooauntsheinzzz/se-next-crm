import { ActivityFormModal } from "@/components/activities/ActivityFormModal";
import type { ActivityCreateRequest } from "@/types/activity";
import type { Lead } from "@/types/lead";
import type { Opportunity } from "@/types/opportunity";
import type { User } from "@/types/user";

interface ScheduleActivityModalProps {
  open: boolean;
  loading?: boolean;
  users: User[];
  opportunities: Opportunity[];
  leads: Lead[];
  initialRecordType?: "opportunity" | "lead";
  initialOpportunityId?: number;
  initialLeadId?: number;
  onClose: () => void;
  onSubmit: (payload: ActivityCreateRequest) => Promise<void>;
}

export const ScheduleActivityModal = ({
  open,
  loading,
  users,
  opportunities,
  leads,
  initialRecordType,
  initialOpportunityId,
  initialLeadId,
  onClose,
  onSubmit,
}: ScheduleActivityModalProps) => {
  return (
    <ActivityFormModal
      open={open}
      mode="create"
      loading={loading}
      users={users}
      opportunities={opportunities}
      leads={leads}
      initialRecordType={initialRecordType}
      initialOpportunityId={initialOpportunityId}
      initialLeadId={initialLeadId}
      onClose={onClose}
      onSubmit={async (payload) => onSubmit(payload as ActivityCreateRequest)}
    />
  );
};
