"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloudUpload, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { attachmentService } from "@/services/attachmentService";
import { getApiMessage } from "@/lib/utils";
import type { AttachmentEntityType } from "@/types/attachment";

interface AttachmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: AttachmentEntityType;
  entityId: number;
  onUploadComplete: () => Promise<void> | void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".sh", ".cmd", ".ps1"];

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const getExtension = (fileName: string) => {
  const index = fileName.lastIndexOf(".");
  if (index === -1) {
    return "";
  }
  return fileName.slice(index).toLowerCase();
};

export const AttachmentUploadModal = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  onUploadComplete,
}: AttachmentUploadModalProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) {
      return "";
    }
    return `${selectedFile.name} (${formatFileSize(selectedFile.size)})`;
  }, [selectedFile]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setDescription("");
      setDragOver(false);
      setUploading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be 10MB or smaller");
      return false;
    }

    const extension = getExtension(file.name);
    if (BLOCKED_EXTENSIONS.includes(extension)) {
      toast.error("File type not allowed");
      return false;
    }

    return true;
  };

  const onFileSelected = (file: File | null) => {
    if (!file) {
      return;
    }
    if (!validateFile(file)) {
      return;
    }
    setSelectedFile(file);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
    event.target.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    onFileSelected(file);
  };

  const onUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      await attachmentService.upload({
        file: selectedFile,
        entityType,
        entityId,
        description: description.trim() || undefined,
      });
      toast.success("File uploaded successfully");
      await onUploadComplete();
      onClose();
    } catch (error) {
      toast.error(getApiMessage(error, "Failed to upload file"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Upload File</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`mt-4 rounded-lg border-2 border-dashed p-6 text-center transition ${
            dragOver ? "border-purple-500 bg-purple-50" : "border-slate-300 bg-slate-50"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <CloudUpload className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            Drag & drop your file here, or{" "}
            <button
              type="button"
              className="font-medium text-[#8B6DD0] hover:underline"
              onClick={() => inputRef.current?.click()}
            >
              Browse Files
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-400">Max 10MB · PDF, DOC, XLS, IMG, etc.</p>
          <input ref={inputRef} type="file" className="hidden" onChange={onInputChange} />
        </div>

        {selectedFile ? (
          <div className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="truncate text-slate-700" title={selectedFileLabel}>
              Selected: {selectedFileLabel}
            </p>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="ml-2 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Remove
            </button>
          </div>
        ) : null}

        <div className="mt-3">
          <label className="text-sm font-medium text-slate-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Enter file description..."
            className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none ring-[#8B6DD0] transition focus:ring-2"
          />
        </div>

        {uploading ? (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#8B6DD0]" />
          </div>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile || uploading}
            onClick={() => void onUpload()}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#8B6DD0] px-3 text-sm font-medium text-white transition-colors hover:bg-[#7F61C6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
};
