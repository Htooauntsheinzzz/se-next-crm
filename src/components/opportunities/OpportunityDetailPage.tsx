"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useOpportunity } from "@/hooks/useOpportunity";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { useLostReasons } from "@/hooks/useLostReasons";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { opportunityService } from "@/services/opportunityService";
import { contactService } from "@/services/contactService";
import { activityService } from "@/services/activityService";
import { leadService } from "@/services/leadService";
import { userService } from "@/services/userService";
import { teamService } from "@/services/teamService";
import { OpportunityStageProgress } from "@/components/opportunities/OpportunityStageProgress";
import { OpportunityKpiCards } from "@/components/opportunities/OpportunityKpiCards";
import { OpportunitySidebar } from "@/components/opportunities/OpportunitySidebar";
import { StageBadge } from "@/components/opportunities/StageBadge";
import { EditOpportunityModal } from "@/components/opportunities/EditOpportunityModal";
import { MarkWonModal } from "@/components/opportunities/MarkWonModal";
import { MarkLostModal } from "@/components/opportunities/MarkLostModal";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ScheduleActivityModal } from "@/components/activities/ScheduleActivityModal";
import { getApiMessage } from "@/lib/utils";
import type { Contact, TagDto } from "@/types/contact";
import type { Activity, ActivityCreateRequest } from "@/types/activity";
import type { Lead } from "@/types/lead";
import type { Opportunity, OpportunityUpdateRequest } from "@/types/opportunity";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

interface OpportunityDetailPageProps {
  id: number;
}

export const OpportunityDetailPage = ({ id }: OpportunityDetailPageProps) => {
  const router = useRouter();
  const { isAdmin } = useRoleGuard();
  const { opportunity, loading, error, refetch } = useOpportunity(id);
  const { stages } = usePipelineStages();
  const { reasons } = useLostReasons(true);
  const [tab, setTab] = useState<"activities" | "chatter">("activities");
  const [contact, setContact] = useState<Contact | null>(null);
  const [leadFallback, setLeadFallback] = useState<Lead | null>(null);
  const [opportunityActivities, setOpportunityActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);

  const [showEdit, setShowEdit] = useState(false);
  const [showWon, setShowWon] = useState(false);
  const [showLost, setShowLost] = useState(false);
  const [showScheduleActivity, setShowScheduleActivity] = useState(false);
  const [lostReasonId, setLostReasonId] = useState<number | undefined>(undefined);
  const [lostNote, setLostNote] = useState("");
  const [stateLoading, setStateLoading] = useState(false);
  const [stageLoading, setStageLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveActivityLoading, setSaveActivityLoading] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [usersResponse, teamsResponse, tagsResponse] = await Promise.all([
          userService.getAll(0, 500),
          teamService.getAll(),
          contactService.getTags(),
        ]);
        setUsers(usersResponse.content ?? []);
        setTeams(teamsResponse ?? []);
        setTags(tagsResponse ?? []);
      } catch {
        // optional for detail page edit modal
      }
    };

    void loadFormData();
  }, []);

  useEffect(() => {
    let active = true;

    const loadRelatedContact = async () => {
      if (!opportunity) {
        if (active) {
          setContact(null);
          setLeadFallback(null);
        }
        return;
      }

      if (opportunity.contactId) {
        try {
          const response = await contactService.getById(opportunity.contactId);
          if (!active) {
            return;
          }
          setContact(response);
          setLeadFallback(null);
        } catch {
          if (!active) {
            return;
          }
          setContact(null);
          setLeadFallback(null);
        }
        return;
      }

      if (opportunity.leadId) {
        try {
          const lead = await leadService.getById(opportunity.leadId);
          if (!active) {
            return;
          }
          setLeadFallback(lead);
          setContact(null);
        } catch {
          if (!active) {
            return;
          }
          setLeadFallback(null);
          setContact(null);
        }
        return;
      }

      if (active) {
        setContact(null);
        setLeadFallback(null);
      }
    };

    void loadRelatedContact();
    return () => {
      active = false;
    };
  }, [opportunity]);

  const fetchOpportunityActivities = async (opportunityId: number) => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      const response = await activityService.getForOpportunity(opportunityId);
      setOpportunityActivities(response);
    } catch (err) {
      setActivitiesError(getApiMessage(err, "Failed to load activities"));
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (!opportunity?.id) {
      setOpportunityActivities([]);
      return;
    }

    void fetchOpportunityActivities(opportunity.id);
  }, [opportunity?.id]);

  const displayContactName =
    contact?.fullName ??
    opportunity?.contactName ??
    leadFallback?.contactFullName ??
    leadFallback?.contactName ??
    "—";

  const stage = useMemo(
    () => stages.find((item) => item.id === opportunity?.stageId),
    [opportunity?.stageId, stages],
  );

  const handleSaveEdit = async (payload: OpportunityUpdateRequest) => {
    if (!opportunity) {
      return;
    }

    try {
      setSaveLoading(true);
      await opportunityService.update(opportunity.id, payload);
      toast.success("Opportunity updated");
      setShowEdit(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update opportunity"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMarkWon = async () => {
    if (!opportunity) {
      return;
    }

    try {
      setSaveLoading(true);
      await opportunityService.markWon(opportunity.id);
      toast.success("Opportunity marked as won");
      setShowWon(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark as won"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMarkLost = async () => {
    if (!opportunity) {
      return;
    }

    try {
      setSaveLoading(true);
      await opportunityService.markLost(opportunity.id, {
        lostReasonId,
        lostNote: lostNote.trim() || undefined,
      });
      toast.success("Opportunity marked as lost");
      setShowLost(false);
      setLostReasonId(undefined);
      setLostNote("");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark as lost"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunity) {
      return;
    }

    const confirmed = window.confirm("Delete this opportunity?");
    if (!confirmed) {
      return;
    }

    try {
      await opportunityService.delete(opportunity.id);
      toast.success("Opportunity deleted");
      router.push("/opportunities?view=list");
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete opportunity"));
    }
  };

  const handleStateChange = async (state: Opportunity["kanbanState"]) => {
    if (!opportunity) {
      return;
    }

    try {
      setStateLoading(true);
      await opportunityService.updateKanbanState(opportunity.id, state);
      toast.success("Kanban state updated");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update state"));
    } finally {
      setStateLoading(false);
    }
  };

  const handleMoveStage = async (nextStageId: number) => {
    if (!opportunity || nextStageId === opportunity.stageId) {
      return;
    }

    try {
      setStageLoading(true);
      await opportunityService.moveStage(opportunity.id, nextStageId);
      const nextStage = stages.find((item) => item.id === nextStageId);
      toast.success(nextStage ? `Moved to ${nextStage.name}` : "Stage updated");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to move stage"));
    } finally {
      setStageLoading(false);
    }
  };

  const handleScheduleActivity = async (payload: ActivityCreateRequest) => {
    if (!opportunity) {
      return;
    }

    try {
      setSaveActivityLoading(true);
      await activityService.create({
        ...payload,
        opportunityId: opportunity.id,
        leadId: undefined,
      });
      toast.success("Activity scheduled");
      setShowScheduleActivity(false);
      await fetchOpportunityActivities(opportunity.id);
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to schedule activity"));
    } finally {
      setSaveActivityLoading(false);
    }
  };

  const handleMarkActivityDone = async (activity: Activity) => {
    if (!opportunity) {
      return;
    }

    try {
      await activityService.markDone(activity.id);
      toast.success("Activity completed");
      await fetchOpportunityActivities(opportunity.id);
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark activity done"));
    }
  };

  const handleUndoActivity = async (activity: Activity) => {
    if (!opportunity) {
      return;
    }

    try {
      await activityService.undoDone(activity.id);
      toast.success("Activity marked as to-do");
      await fetchOpportunityActivities(opportunity.id);
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to undo activity"));
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="h-[480px] animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error ?? "Opportunity not found"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Link href="/opportunities" className="text-xs font-medium text-slate-500 hover:text-slate-700">
          ← Back to Pipeline
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold text-slate-900">{opportunity.name}</h1>
          <StageBadge stageName={opportunity.stageName} stage={stage} />
          {opportunity.kanbanState === "READY" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : null}
        </div>

        <div className="mt-4">
          <OpportunityStageProgress
            stages={stages}
            currentStageId={opportunity.stageId}
            disabled={stageLoading}
            onStageClick={(nextStageId) => void handleMoveStage(nextStageId)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWon(true)}
            className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Won
          </button>
          <button
            type="button"
            onClick={() => setShowLost(true)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Mark as Lost
          </button>
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <OpportunityKpiCards opportunity={opportunity} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">Details</h3>
            <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Opportunity Name</p>
                <p className="font-medium">{opportunity.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Contact</p>
                <p className="font-medium text-[#8B6FD0]">{displayContactName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Salesperson</p>
                <p className="font-medium">{opportunity.salespersonName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Team</p>
                <p className="font-medium">{opportunity.teamName ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {opportunity.tags.length ? (
                opportunity.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-[#D9CFF5] bg-[#F4EEFF] px-2 py-0.5 text-xs font-medium text-[#7A58BE]"
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No tags</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">Notes</h3>
            <p className="mt-2 text-sm text-slate-600">
              {opportunity.notes ?? "No notes available for this opportunity."}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTab("activities")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tab === "activities"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Activities
              </button>
              <button
                type="button"
                onClick={() => setTab("chatter")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tab === "chatter"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Chatter
              </button>
            </div>

            {tab === "activities" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowScheduleActivity(true)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Schedule Activity
                  </button>
                </div>

                {activitiesLoading ? (
                  <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
                ) : activitiesError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {activitiesError}
                  </div>
                ) : opportunityActivities.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                    No activities scheduled yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunityActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onMarkDone={handleMarkActivityDone}
                        onUndo={handleUndoActivity}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">John Smith</p>
                  <p className="text-xs text-slate-500">note • 2024-03-29 3:20 PM</p>
                  <p className="mt-1 text-slate-600">
                    Sent detailed proposal with pricing breakdown.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">System</p>
                  <p className="text-xs text-slate-500">system • 2024-03-28 10:15 AM</p>
                  <p className="mt-1 text-slate-600">
                    Stage changed from Qualification to Proposal.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <OpportunitySidebar
          opportunity={opportunity}
          stages={stages}
          contact={contact}
          leadFallback={leadFallback}
          stateLoading={stateLoading}
          onStateChange={handleStateChange}
        />
      </div>

      <EditOpportunityModal
        open={showEdit}
        loading={saveLoading}
        opportunity={opportunity}
        stages={stages}
        users={users}
        teams={teams}
        tags={tags}
        onClose={() => setShowEdit(false)}
        onSubmit={handleSaveEdit}
      />

      <MarkWonModal
        open={showWon}
        loading={saveLoading}
        opportunity={opportunity}
        onClose={() => setShowWon(false)}
        onConfirm={handleMarkWon}
      />

      <MarkLostModal
        open={showLost}
        loading={saveLoading}
        reasons={reasons}
        opportunity={opportunity}
        selectedReasonId={lostReasonId}
        note={lostNote}
        onReasonChange={setLostReasonId}
        onNoteChange={setLostNote}
        onClose={() => setShowLost(false)}
        onConfirm={handleMarkLost}
      />

      <ScheduleActivityModal
        open={showScheduleActivity}
        loading={saveActivityLoading}
        users={users}
        opportunities={opportunity ? [opportunity] : []}
        leads={[]}
        initialRecordType="opportunity"
        initialOpportunityId={opportunity.id}
        onClose={() => setShowScheduleActivity(false)}
        onSubmit={handleScheduleActivity}
      />
    </div>
  );
};
