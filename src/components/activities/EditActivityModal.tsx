import { ActivityFormModal } from "@/components/activities/ActivityFormModal";
import type { Activity, ActivityUpdateRequest } from "@/types/activity";
import type { Lead } from "@/types/lead";
import type { Opportunity } from "@/types/opportunity";
import type { User } from "@/types/user";

interface EditActivityModalProps {
  open: boolean;
  loading?: boolean;
  activity: Activity | null;
  users: User[];
  opportunities: Opportunity[];
  leads: Lead[];
  onClose: () => void;
  onSubmit: (payload: ActivityUpdateRequest) => Promise<void>;
}

export const EditActivityModal = ({
  open,
  loading,
  activity,
  users,
  opportunities,
  leads,
  onClose,
  onSubmit,
}: EditActivityModalProps) => {
  return (
    <ActivityFormModal
      open={open}
      mode="edit"
      loading={loading}
      users={users}
      opportunities={opportunities}
      leads={leads}
      initialActivity={activity}
      onClose={onClose}
      onSubmit={async (payload) => onSubmit(payload as ActivityUpdateRequest)}
    />
  );
};
