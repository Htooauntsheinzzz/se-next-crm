import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  GitMerge,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import type { Lead } from "@/types/lead";

interface LeadActionsProps {
  lead: Lead;
  canDelete?: boolean;
  flipUp?: boolean;
  onEdit: (lead: Lead) => void;
  onAssign: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onViewScore: (lead: Lead) => void;
  onMerge: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

const MENU_MIN_WIDTH = 190;

export const LeadActions = ({
  lead,
  canDelete = false,
  flipUp = false,
  onEdit,
  onAssign,
  onConvert,
  onViewScore,
  onMerge,
  onDelete,
}: LeadActionsProps) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const convertDisabled = lead.status === "CONVERTED" || lead.status === "LOST";

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    const updatePosition = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth ?? MENU_MIN_WIDTH;
      const estimatedHeight = canDelete ? 270 : 230;
      const menuHeight = menuRef.current?.offsetHeight ?? estimatedHeight;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUp =
        spaceBelow < menuHeight + 8 && (spaceAbove > spaceBelow || flipUp);

      const top = shouldOpenUp
        ? Math.max(8, rect.top - menuHeight - 8)
        : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 8);

      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );

      setMenuPosition({ top, left });
    };

    const raf = window.requestAnimationFrame(updatePosition);

    const handleReposition = () => {
      window.requestAnimationFrame(updatePosition);
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [canDelete, flipUp, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Lead actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: menuPosition?.top ?? 0,
                left: menuPosition?.left ?? 0,
              }}
              className="app-shell-font z-[80] min-w-[190px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit(lead);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAssign(lead);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <UserPlus className="h-4 w-4" />
                Assign
              </button>

              <button
                type="button"
                disabled={convertDisabled}
                onClick={() => {
                  setOpen(false);
                  if (!convertDisabled) {
                    onConvert(lead);
                  }
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4" />
                Convert to Opportunity
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onViewScore(lead);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4" />
                View Score
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onMerge(lead);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <GitMerge className="h-4 w-4" />
                Merge
              </button>

              {canDelete ? (
                <>
                  <div className="my-1 border-t border-slate-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onDelete(lead);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
