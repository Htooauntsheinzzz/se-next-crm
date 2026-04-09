"use client";

import { MessageSquare, Mail } from "lucide-react";
import { toast } from "sonner";
import { AddNoteForm } from "@/components/chatter/AddNoteForm";
import { ChatterTimeline } from "@/components/chatter/ChatterTimeline";
import { LogEmailModal } from "@/components/chatter/LogEmailModal";
import { useChatter } from "@/hooks/useChatter";
import { chatterService } from "@/services/chatterService";
import { getApiMessage } from "@/lib/utils";
import type { ChatterPanelProps, EmailLogRequest } from "@/types/chatter";
import { useState } from "react";

export const ChatterPanel = ({ entityType, entityId }: ChatterPanelProps) => {
  const { messages, loading, error, refetch } = useChatter(entityType, entityId, {
    enabled: Boolean(entityId),
    refreshIntervalMs: 30000,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [postingNote, setPostingNote] = useState(false);
  const [loggingEmail, setLoggingEmail] = useState(false);

  const handleAddNote = async (body: string) => {
    try {
      setPostingNote(true);
      await chatterService.addNote({
        body,
        opportunityId: entityType === "opportunity" ? entityId : undefined,
        leadId: entityType === "lead" ? entityId : undefined,
      });
      toast.success("Note added");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to add note"));
      throw err;
    } finally {
      setPostingNote(false);
    }
  };

  const handleLogEmail = async (payload: EmailLogRequest) => {
    try {
      setLoggingEmail(true);
      await chatterService.logEmail({
        ...payload,
        opportunityId: entityType === "opportunity" ? entityId : undefined,
        leadId: entityType === "lead" ? entityId : undefined,
      });
      toast.success("Email logged");
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to log email"));
      throw err;
    } finally {
      setLoggingEmail(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MessageSquare className="h-4 w-4 text-slate-600" />
          Chatter
        </h4>
        <button
          type="button"
          onClick={() => setShowEmailModal(true)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Mail className="h-3.5 w-3.5" />
          Log Email
        </button>
      </div>

      <AddNoteForm loading={postingNote} onSubmit={handleAddNote} />

      <ChatterTimeline messages={messages} loading={loading} error={error} />

      <LogEmailModal
        open={showEmailModal}
        loading={loggingEmail}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleLogEmail}
      />
    </div>
  );
};
