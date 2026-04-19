"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { AttachmentList } from "@/components/attachments/AttachmentList";
const AttachmentUploadModal = dynamic(() => import("@/components/attachments/AttachmentUploadModal").then(m => ({ default: m.AttachmentUploadModal })), { ssr: false });
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { attachmentService } from "@/services/attachmentService";
import { getApiMessage } from "@/lib/utils";
import type { Attachment, AttachmentEntityType } from "@/types/attachment";

interface AttachmentTabProps {
  entityType: AttachmentEntityType;
  entityId: number;
  onCountChange?: (count: number) => void;
}

export const AttachmentTab = ({ entityType, entityId, onCountChange }: AttachmentTabProps) => {
  const { isAdmin, isManager } = useRoleGuard();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const canDelete = isAdmin || isManager;

  const fetchAttachments = useCallback(async () => {
    if (!entityId) {
      setAttachments([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await attachmentService.getByEntity(entityType, entityId);
      const sorted = [...response].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setAttachments(sorted);
    } catch (fetchError) {
      setError(getApiMessage(fetchError, "Failed to load attachments"));
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    void fetchAttachments();
  }, [fetchAttachments]);

  useEffect(() => {
    onCountChange?.(attachments.length);
  }, [attachments.length, onCountChange]);

  const onDelete = async (attachmentId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (!confirmed) {
      return;
    }

    try {
      await attachmentService.delete(attachmentId);
      toast.success("Attachment deleted");
      await fetchAttachments();
    } catch (deleteError) {
      toast.error(getApiMessage(deleteError, "Failed to delete attachment"));
    }
  };

  const onDownload = async (attachmentId: number, originalName: string) => {
    try {
      await attachmentService.download(attachmentId, originalName);
    } catch (downloadError) {
      toast.error(getApiMessage(downloadError, "Failed to download attachment"));
    }
  };

  const title = useMemo(() => `Attachments (${attachments.length})`, [attachments.length]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Paperclip className="h-4 w-4 text-slate-600" />
          {title}
        </h4>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#8B6DD0] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7F61C6]"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      </div>

      <AttachmentList
        attachments={attachments}
        loading={loading}
        error={error}
        onDelete={onDelete}
        onDownload={onDownload}
        canDelete={canDelete}
        onUploadClick={() => setShowUploadModal(true)}
      />

      <AttachmentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        entityType={entityType}
        entityId={entityId}
        onUploadComplete={fetchAttachments}
      />
    </div>
  );
};
