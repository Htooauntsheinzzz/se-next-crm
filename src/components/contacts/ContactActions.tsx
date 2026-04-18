import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, GitMerge, MoreVertical, Pencil, UserX } from "lucide-react";
import type { Contact } from "@/types/contact";
import type { User } from "@/types/user";
import { canEditContact, canMergeContacts } from "@/lib/auth/rbac";

interface ContactActionsProps {
  contact: Contact;
  currentUser?: User | null;
  flipUp?: boolean;
  onEdit: (contact: Contact) => void;
  onViewHistory: (contact: Contact) => void;
  onMerge?: (contact: Contact) => void;
  onDeactivate: (contact: Contact) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

const MENU_MIN_WIDTH = 180;

export const ContactActions = ({
  contact,
  currentUser,
  flipUp = false,
  onEdit,
  onViewHistory,
  onMerge,
  onDeactivate,
}: ContactActionsProps) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
      const estimatedHeight = 190;
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
  }, [flipUp, open]);

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

  const canEdit = currentUser ? canEditContact(currentUser, contact) : false;
  const canMerge = currentUser ? canMergeContacts(currentUser) : false;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Contact actions"
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
              className="app-shell-font z-[80] min-w-[180px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onEdit(contact);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onViewHistory(contact);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Clock3 className="h-4 w-4" />
                View History
              </button>

              {canMerge && onMerge && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onMerge(contact);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <GitMerge className="h-4 w-4" />
                  Merge
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onDeactivate(contact);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4" />
                  Deactivate
                </button>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
