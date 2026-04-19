import { CloudUpload } from "lucide-react";
import { AttachmentCard } from "@/components/attachments/AttachmentCard";
import type { Attachment } from "@/types/attachment";

interface AttachmentListProps {
  attachments: Attachment[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => void;
  onDownload: (id: number, originalName: string) => void;
  canDelete: boolean;
  onUploadClick: () => void;
}

export const AttachmentList = ({
  attachments,
  loading,
  error,
  onDelete,
  onDownload,
  canDelete,
  onUploadClick,
}: AttachmentListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!attachments.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
        <CloudUpload className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-500">No files attached yet</p>
        <p className="mt-1 text-xs text-slate-400">Upload documents, images, or other files</p>
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-4 inline-flex h-9 items-center rounded-lg bg-[#8B6DD0] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7F61C6]"
        >
          Upload File
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <AttachmentCard
          key={attachment.id}
          attachment={attachment}
          onDelete={onDelete}
          onDownload={onDownload}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
};
