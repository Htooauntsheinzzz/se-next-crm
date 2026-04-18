"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ContactTabs, type ContactTab } from "@/components/contacts/ContactTabs";
import { ContactFilters } from "@/components/contacts/ContactFilters";
import { ContactTable } from "@/components/contacts/ContactTable";
import { ContactGrid } from "@/components/contacts/ContactGrid";
import { CreateContactModal } from "@/components/contacts/CreateContactModal";
import { EditContactModal } from "@/components/contacts/EditContactModal";
import { ContactHistoryDrawer } from "@/components/contacts/ContactHistoryDrawer";
import { MergeContactModal } from "@/components/contacts/MergeContactModal";
import { DeactivateContactModal } from "@/components/contacts/DeactivateContactModal";
import { useContacts } from "@/hooks/useContacts";
import { contactService } from "@/services/contactService";
import { userService } from "@/services/userService";
import { teamService } from "@/services/teamService";
import { getApiMessage } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isAdmin, isManager, isRep, canMergeContacts } from "@/lib/auth/rbac";
import type { Contact, ContactCreateRequest, ContactUpdateRequest, TagDto } from "@/types/contact";
import type { User } from "@/types/user";
import type { SalesTeam } from "@/types/team";

const PAGE_SIZE = 20;

const defaultCountries = ["USA", "UK", "Canada", "Australia", "Singapore", "Thailand", "Myanmar"];

export const ContactListPage = () => {
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<ContactTab>("ALL");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [historyContactId, setHistoryContactId] = useState<number | null>(null);
  const [mergeContact, setMergeContact] = useState<Contact | null>(null);
  const [deactivateContact, setDeactivateContact] = useState<Contact | null>(null);

  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingMerge, setSavingMerge] = useState(false);
  const [savingDeactivate, setSavingDeactivate] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [companies, setCompanies] = useState<Contact[]>([]);
  const [teams, setTeams] = useState<SalesTeam[]>([]);

  const typeFilter = activeTab === "ALL" ? undefined : activeTab;
  const { currentUser } = useCurrentUser();
  const admin = isAdmin(currentUser);
  const manager = isManager(currentUser);
  const rep = isRep(currentUser);

  const { contacts, counts, currentPage, totalElements, totalPages, loading, error, refetch } = useContacts({
    page,
    size: PAGE_SIZE,
    search,
    country,
    type: typeFilter,
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getAll(0, 500);
        setUsers(response.content ?? []);
      } catch {
        setUsers([]);
      }
    };

    if (currentUser !== undefined) {
      void loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await contactService.getTags();
        setTags(response ?? []);
      } catch (err) {
        toast.error(getApiMessage(err, "Failed to load tags"));
        setTags([]);
      }
    };

    void loadTags();
  }, []);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await teamService.getAll();
        setTeams(response ?? []);
      } catch {
        setTeams([]);
      }
    };

    void loadTeams();
  }, []);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await contactService.getCompanies({ page: 0, size: 500 });
        setCompanies(response.content ?? []);
      } catch {
        setCompanies([]);
      }
    };

    void loadCompanies();
  }, []);

  const countries = useMemo(() => {
    const unique = new Set(defaultCountries);
    contacts.forEach((contact) => {
      if (contact.country) {
        unique.add(contact.country);
      }
    });
    return Array.from(unique);
  }, [contacts]);

  const showingCountText = useMemo(() => {
    return `Showing ${contacts.length} of ${totalElements} contacts`;
  }, [contacts.length, totalElements]);

  const openEdit = (contact: Contact) => {
    setEditContact(contact);
  };

  const onSubmitCreate = async (payload: ContactCreateRequest) => {
    try {
      setSavingCreate(true);
      await contactService.create(payload);
      toast.success("Contact created successfully");
      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to create contact"));
    } finally {
      setSavingCreate(false);
    }
  };

  const onSubmitEdit = async (payload: ContactUpdateRequest) => {
    if (!editContact) {
      return;
    }

    try {
      setSavingEdit(true);
      await contactService.update(editContact.id, payload);
      toast.success("Contact updated successfully");
      setEditContact(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to update contact"));
    } finally {
      setSavingEdit(false);
    }
  };

  const onSubmitMerge = async (duplicateId: number) => {
    if (!mergeContact) {
      return;
    }

    try {
      setSavingMerge(true);
      await contactService.merge(mergeContact.id, { duplicateId });
      toast.success("Contacts merged successfully");
      setMergeContact(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to merge contacts"));
    } finally {
      setSavingMerge(false);
    }
  };

  const onConfirmDeactivate = async () => {
    if (!deactivateContact) {
      return;
    }

    try {
      setSavingDeactivate(true);
      await contactService.deactivate(deactivateContact.id);
      toast.success("Contact deactivated");
      setDeactivateContact(null);
      await refetch();
    } catch (err) {
      toast.error(getApiMessage(err, "Failed to deactivate contact"));
    } finally {
      setSavingDeactivate(false);
    }
  };

  let title = "All Contacts";
  let subtitle = "Showing all contacts.";
  let badgeLabel = "";
  let badgeClass = "";

  if (admin) {
    badgeLabel = "Admin view";
    badgeClass = "bg-violet-50 text-violet-700 border-violet-200";
  } else if (manager) {
    badgeLabel = currentUser?.teamName || "Team";
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (rep) {
    badgeLabel = "Assigned to me";
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return (
    <>
      <div className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[34px] font-semibold leading-tight text-slate-900">{title}</h1>
              {badgeLabel && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
                  {badgeLabel}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-[#8B6FD0] px-4 text-sm font-semibold text-white transition hover:bg-[#7D62C4]"
          >
            <Plus className="h-4 w-4" />
            Create Contact
          </button>
        </header>

        <ContactTabs
          activeTab={activeTab}
          counts={counts}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setPage(0);
          }}
        />

        <ContactFilters
          search={search}
          type={typeFilter ?? ""}
          country={country}
          countries={countries}
          assignedTo={assignedTo}
          users={users}
          showAssignedTo={true}
          viewMode={viewMode}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          onTypeChange={(value) => {
            setActiveTab(value || "ALL");
            setPage(0);
          }}
          onCountryChange={(value) => {
            setCountry(value);
            setPage(0);
          }}
          onAssignedToChange={(value) => {
            setAssignedTo(value);
            setPage(0);
          }}
          onViewModeChange={setViewMode}
        />

        <p className="text-sm text-slate-500">{showingCountText}</p>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="ml-3 font-semibold underline"
              onClick={() => void refetch()}
            >
              Retry
            </button>
          </div>
        ) : null}

        {viewMode === "grid" ? (
          <ContactGrid
            contacts={contacts}
            loading={loading}
            currentUser={currentUser}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onCreate={() => setShowCreateModal(true)}
            onEdit={openEdit}
            onViewHistory={(contact) => setHistoryContactId(contact.id)}
            onMerge={canMergeContacts(currentUser!) ? (contact) => setMergeContact(contact) : undefined}
            onDeactivate={(contact) => setDeactivateContact(contact)}
          />
        ) : (
          <ContactTable
            contacts={contacts}
            loading={loading}
            currentUser={currentUser}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onCreate={() => setShowCreateModal(true)}
            onEdit={openEdit}
            onViewHistory={(contact) => setHistoryContactId(contact.id)}
            onMerge={canMergeContacts(currentUser!) ? (contact) => setMergeContact(contact) : undefined}
            onDeactivate={(contact) => setDeactivateContact(contact)}
          />
        )}
      </div>

      <CreateContactModal
        open={showCreateModal}
        loading={savingCreate}
        users={users}
        tags={tags}
        companies={companies}
        teams={teams}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onSubmitCreate}
      />

      <EditContactModal
        open={Boolean(editContact)}
        loading={savingEdit}
        contact={editContact}
        users={users}
        tags={tags}
        companies={companies}
        teams={teams}
        onClose={() => setEditContact(null)}
        onSubmit={onSubmitEdit}
      />

      <ContactHistoryDrawer
        open={Boolean(historyContactId)}
        contactId={historyContactId}
        onClose={() => setHistoryContactId(null)}
      />

      <MergeContactModal
        open={Boolean(mergeContact)}
        primaryContact={mergeContact}
        loading={savingMerge}
        onClose={() => setMergeContact(null)}
        onSubmit={onSubmitMerge}
      />

      <DeactivateContactModal
        open={Boolean(deactivateContact)}
        contact={deactivateContact}
        loading={savingDeactivate}
        onClose={() => setDeactivateContact(null)}
        onConfirm={onConfirmDeactivate}
      />
    </>
  );
};
