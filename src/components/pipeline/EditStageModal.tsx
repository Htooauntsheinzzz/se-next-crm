"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { PipelineStageDto, StageUpdateRequest } from "@/types/pipeline";

interface EditStageModalProps {
  open: boolean;
  loading?: boolean;
  stage: PipelineStageDto | null;
  onClose: () => void;
  onSubmit: (payload: StageUpdateRequest) => Promise<void>;
}

export const EditStageModal = ({
  open,
  loading = false,
  stage,
  onClose,
  onSubmit,
}: EditStageModalProps) => {
  const [name, setName] = useState("");
  const [probability, setProbability] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);

  useEffect(() => {
    if (!open || !stage) {
      return;
    }
    setName(stage.name);
    setProbability(stage.probability);
    setIsWon(stage.isWon);
    setIsLost(stage.isLost);
  }, [open, stage]);

  if (!open || !stage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="app-shell-font w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Edit Pipeline Stage</h3>
            <p className="text-sm text-slate-500">Update stage information and settings</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Stage Name *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700"
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">
              Win Probability: {probability}%
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={probability}
              onChange={(event) => setProbability(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#8B6FD0]"
            />
            <p className="mt-1 text-xs text-slate-500">
              Estimated likelihood of winning deals in this stage
            </p>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Mark as Won Stage</p>
              <p className="text-xs text-slate-500">
                This stage represents successfully closed deals
              </p>
            </div>
            <input
              type="checkbox"
              checked={isWon}
              onChange={(event) => {
                const checked = event.target.checked;
                setIsWon(checked);
                if (checked) {
                  setIsLost(false);
                }
              }}
              className="h-4 w-4 accent-[#8B6FD0]"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Mark as Lost Stage</p>
              <p className="text-xs text-slate-500">
                This stage represents lost or rejected deals
              </p>
            </div>
            <input
              type="checkbox"
              checked={isLost}
              onChange={(event) => {
                const checked = event.target.checked;
                setIsLost(checked);
                if (checked) {
                  setIsWon(false);
                }
              }}
              className="h-4 w-4 accent-[#8B6FD0]"
            />
          </label>

          {stage.opportunityCount > 0 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
              {stage.opportunityCount} opportunities are currently in this stage. Changes
              will affect all associated opportunities.
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || name.trim().length === 0}
            onClick={() =>
              void onSubmit({
                name: name.trim(),
                probability,
                isWon,
                isLost,
              })
            }
            className="rounded-lg bg-[#8B6FD0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7A58BE] disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
