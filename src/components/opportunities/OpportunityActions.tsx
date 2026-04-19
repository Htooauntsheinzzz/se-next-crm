import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import type { Opportunity } from "@/types/opportunity";

interface OpportunityActionsProps {
  opportunity: Opportunity;
  canDelete: boolean;
  onView: (opportunity: Opportunity) => void;
  onEdit: (opportunity: Opportunity) => void;
  onMarkWon: (opportunity: Opportunity) => void;
  onMarkLost: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

export const OpportunityActions = ({
  opportunity,
  canDelete,
  onView,
  onEdit,
  onMarkWon,
  onMarkLost,
  onDelete,
}: OpportunityActionsProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open === false) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (trigger === null) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth ?? 190;
      const menuHeight = menuRef.current?.offsetHeight ?? 230;

      const openUp = window.innerHeight - rect.bottom < menuHeight + 8;

      const top = openUp
        ? Math.max(8, rect.top - menuHeight - 8)
        : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 8);

      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );

      setPosition({ top, left });
    };

    const frame = window.requestAnimationFrame(updatePosition);

    const reposition = () => {
      window.requestAnimationFrame(updatePosition);
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (open === false) {
      return;
    }

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const canMarkWon = opportunity.wonAt === null && opportunity.lostAt === null;
  const canMarkLost = opportunity.lostAt === null && opportunity.wonAt === null;

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => prev === false)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Opportunity actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: position?.top ?? 0,
                left: position?.left ?? 0,
              }}
              className="app-shell-font z-[90] min-w-[190px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onView(opportunity);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit(opportunity);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                disabled={canMarkWon === false}
                onClick={() => {
                  setOpen(false);
                  if (canMarkWon) {
                    onMarkWon(opportunity);
                  }
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Won
              </button>

              <button
                type="button"
                disabled={canMarkLost === false}
                onClick={() => {
                  setOpen(false);
                  if (canMarkLost) {
                    onMarkLost(opportunity);
                  }
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Mark Lost
              </button>

              {canDelete ? (
                <>
                  <div className="my-1 border-t border-slate-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onDelete(opportunity);
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
