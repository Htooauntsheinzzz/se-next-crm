"use client";

import { useEffect, useMemo, useState } from "react";
import { isWithinInterval, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ActivitySummaryCards, type ActivityQuickFilter } from "@/components/activities/ActivitySummaryCards";
import { ActivityTabs } from "@/components/activities/ActivityTabs";
import { ActivityList } from "@/components/activities/ActivityList";
import dynamic from "next/dynamic";
const ScheduleActivityModal = dynamic(() => import("@/components/activities/ScheduleActivityModal").then(m => ({ default: m.ScheduleActivityModal })), { ssr: false });
const EditActivityModal = dynamic(() => import("@/components/activities/EditActivityModal").then(m => ({ default: m.EditActivityModal })), { ssr: false });
const DeleteActivityModal = dynamic(() => import("@/components/activities/DeleteActivityModal").then(m => ({ default: m.DeleteActivityModal })), { ssr: false });
import { useActivities } from "@/hooks/useActivities";
import { useActivitySummary } from "@/hooks/useActivitySummary";
import { useTodayActivities } from "@/hooks/useTodayActivities";
import { useOverdueActivities } from "@/hooks/useOverdueActivities";
import { activityService } from "@/services/activityService";
import { userService } from "@/services/userService";
import { opportunityService } from "@/services/opportunityService";
import { leadService } from "@/services/leadService";
import { getApiMessage } from "@/lib/utils";
import type { Activity, ActivityCreateRequest, ActivityUpdateRequest } from "@/types/activity";
import type { Lead } from "@/types/lead";
import type { Opportunity } from "@/types/opportunity";
import type { User } from "@/types/user";

const PAGE_SIZE = 20;

const isInCurrentWeek = (value: string | null) => {
  if (!value) {
    return false;
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return isWithinInterval(parsed, { start, end });
};

export const ActivitiesPage = () => {
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");
  const [quickFilter, setQuickFilter] = useState<ActivityQuickFilter>("all");
  const [page, setPage] = useState(0);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const isDoneTab = activeTab === "done";
  const usePagedSource = isDoneTab || quickFilter === "all" || quickFilter === "week";

  const {
    activities: pagedActivities,
    currentPage,
    totalPages,
    totalElements,
    loading: pagedLoading,
    error: pagedError,
    refetch: refetchPaged,
  } = useActivities({
    done: isDoneTab,
    page,
    size: PAGE_SIZE,
    enabled: usePagedSource,
  });

  const {
    activities: doneCountActivities,
    totalElements: doneTotalElements,
    refetch: refetchDoneCount,
  } = useActivities({
    done: true,
    page: 0,
    size: 1,
    enabled: true,
  });

  const { summary, loading: summaryLoading, refetch: refetchSummary } = useActivitySummary();

  const {
    activities: todayActivities,
    loading: todayLoading,
    error: todayError,
    refetch: refetchToday,
  } = useTodayActivities(!isDoneTab && quickFilter === "today");

  const {
    activities: overdueActivities,
    loading: overdueLoading,
    error: overdueError,
    refetch: refetchOverdue,
  } = useOverdueActivities(!isDoneTab && quickFilter === "overdue");

  useEffect(() => {
    const loadModalData = async () => {
      try {
        const [usersResponse, opportunityResponse, leadResponse] = await Promise.all([
          userService.getAll(0, 300),
          opportunityService.getAll({ page: 0, size: 200 }),
          leadService.getAll({ page: 0, size: 200 }),
        ]);

        setUsers((usersResponse.content ?? []).filter((user) => user.active));
        setOpportunities(opportunityResponse.content ?? []);
        setLeads(leadResponse.content ?? []);
      } catch (err) {
        toast.error(getApiMessage(err, "Failed to load activity form data"));
      }
    };

    void loadModalData();
  }, []);

  const weekActivities = useMemo(
    () => pagedActivities.filter((activity) => isInCurrentWeek(activity.dueDate)),
    [pagedActivities],
  );

  const displayActivities = useMemo(() => {
    if (isDoneTab) {
      return pagedActivities;
    }
    if (quickFilter === "today") {
      return todayActivities;
    }
    if (quickFilter === "overdue") {
      return overdueActivities;
    }
    if (quickFilter === "week") {
      return weekActivities;
    }
    return pagedActivities;
  }, [isDoneTab, overdueActivities, pagedActivities, quickFilter, todayActivities, weekActivities]);

  const activeLoading = isDoneTab
    ? pagedLoading
    : quickFilter === "today"
      ? todayLoading
      : quickFilter === "overdue"
        ? overdueLoading
        : pagedLoading;

  const activeError = isDoneTab
    ? pagedError
    : quickFilter === "today"
      ? todayError
      : quickFilter === "overdue"
        ? overdueError
        : pagedError;

  const refreshAll = async () => {
    await Promise.all([
      refetchPaged(),
      refetchSummary(),
      refetchToday(),
      refetchOverdue(),
      refetchDoneCount(),
    ]);
  };

  const handleSummarySelect = (filter: ActivityQuickFilter) => {
    setPage(0);
    if (filter === "done") {
      setActiveTab("done");
      setQuickFilter("done");
      return;
    }

    setActiveTab("todo");
    setQuickFilter(filter);
  };

  const handleTabChange = (tab: "todo" | "done") => {
    setActiveTab(tab);
    setPage(0);
    if (tab === "done") {
      setQuickFilter("done");
      return;
    }
    setQuickFilter((prev) => (prev === "done" ? "all" : prev));
  };

  const handleCreate = async (payload: ActivityCreateRequest) => {
    try {
      setCreateLoading(true);
      await activityService.create(payload);
      toast.success("Activity scheduled");
      setShowScheduleModal(false);
      setPage(0);
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to schedule activity"));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = async (payload: ActivityUpdateRequest) => {
    if (!editingActivity) {
      return;
    }

    try {
      setEditLoading(true);
      await activityService.update(editingActivity.id, payload);
      toast.success("Activity updated");
      setEditingActivity(null);
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update activity"));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingActivity) {
      return;
    }

    try {
      setDeleteLoading(true);
      await activityService.delete(deletingActivity.id);
      toast.success("Activity deleted");
      setDeletingActivity(null);
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to delete activity"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMarkDone = async (activity: Activity) => {
    try {
      setActionLoadingId(activity.id);
      await activityService.markDone(activity.id);
      toast.success("Activity completed");
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to mark activity done"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUndo = async (activity: Activity) => {
    try {
      setActionLoadingId(activity.id);
      await activityService.undoDone(activity.id);
      toast.success("Activity marked as to-do");
      await refreshAll();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to undo activity"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const showingText = useMemo(() => {
    if (isDoneTab || quickFilter === "all") {
      return `Showing ${displayActivities.length} of ${totalElements} activities`;
    }
    return `Showing ${displayActivities.length} activities`;
  }, [displayActivities.length, isDoneTab, quickFilter, totalElements]);

  return (
    <>
      <div className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight text-slate-900">Activities</h1>
            <p className="text-sm text-slate-500">Manage your tasks and follow-ups</p>
          </div>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
          >
            <Plus className="h-4 w-4" />
            Schedule Activity
          </button>
        </header>

        <ActivitySummaryCards
          todayCount={summary.todayCount}
          overdueCount={summary.overdueCount}
          thisWeekCount={summary.thisWeekCount}
          doneCount={doneTotalElements || doneCountActivities.length}
          activeFilter={quickFilter}
          onSelect={handleSummarySelect}
        />

        {summaryLoading ? <div className="h-1" /> : null}

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <ActivityTabs activeTab={activeTab} onChange={handleTabChange} />
          <p className="mt-3 text-sm text-slate-500">{showingText}</p>

          <div className="mt-4">
            <ActivityList
              activities={displayActivities.map((activity) =>
                actionLoadingId === activity.id ? { ...activity } : activity,
              )}
              loading={activeLoading}
              error={activeError}
              onMarkDone={handleMarkDone}
              onUndo={handleUndo}
              onEdit={setEditingActivity}
              onDelete={setDeletingActivity}
            />
          </div>

          {usePagedSource && totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                disabled={currentPage <= 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="rounded-md bg-[#8B6FD0] px-3 py-1.5 text-sm font-semibold text-white">
                {currentPage + 1}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <ScheduleActivityModal
        open={showScheduleModal}
        loading={createLoading}
        users={users}
        opportunities={opportunities}
        leads={leads}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleCreate}
      />

      <EditActivityModal
        open={Boolean(editingActivity)}
        loading={editLoading}
        activity={editingActivity}
        users={users}
        opportunities={opportunities}
        leads={leads}
        onClose={() => setEditingActivity(null)}
        onSubmit={handleEdit}
      />

      <DeleteActivityModal
        open={Boolean(deletingActivity)}
        loading={deleteLoading}
        activity={deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleDelete}
      />
    </>
  );
};

