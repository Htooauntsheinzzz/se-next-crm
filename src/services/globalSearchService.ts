import { activityService } from "@/services/activityService";
import { contactService } from "@/services/contactService";
import { leadService } from "@/services/leadService";
import { opportunityService } from "@/services/opportunityService";
import { teamService } from "@/services/teamService";
import { userService } from "@/services/userService";
import { isAdmin, isManager, isRep } from "@/lib/auth/rbac";
import type { Activity } from "@/types/activity";
import type { Contact } from "@/types/contact";
import type { GlobalSearchGroup, GlobalSearchParams, GlobalSearchResult } from "@/types/globalSearch";
import type { Lead } from "@/types/lead";
import type { Opportunity } from "@/types/opportunity";
import type { SalesTeam } from "@/types/team";
import type { User } from "@/types/user";

const DEFAULT_LIMIT_PER_GROUP = 5;

const toRoleLabel = (role: string) => {
  if (role === "SALES_MANAGER") return "Sales Manager";
  if (role === "SALES_REP") return "Sales Rep";
  return "Admin";
};

const normalize = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

const includesQuery = (value: string | null | undefined, query: string) => normalize(value).includes(query);

const take = <T>(items: T[], size: number) => items.slice(0, size);

const filterUsersByScope = (users: User[], currentUser?: User | null) => {
  if (!currentUser) {
    return users;
  }

  if (isAdmin(currentUser)) {
    return users;
  }

  if (isManager(currentUser)) {
    if (!currentUser.teamId) {
      return users.filter((user) => user.id === currentUser.id);
    }

    return users.filter(
      (user) => user.id === currentUser.id || (user.teamId !== null && user.teamId === currentUser.teamId),
    );
  }

  if (isRep(currentUser)) {
    return users.filter((user) => user.id === currentUser.id);
  }

  return users;
};

const mapContacts = (contacts: Contact[], size: number): GlobalSearchGroup => ({
  key: "contact",
  label: "Contacts",
  items: take(contacts, size).map((contact) => ({
    id: String(contact.id),
    title: contact.fullName,
    subtitle:
      contact.type === "PERSON"
        ? [contact.companyName, contact.jobTitle].filter(Boolean).join(" • ") || "Person"
        : [contact.email, contact.country].filter(Boolean).join(" • ") || "Company",
    href: `/contacts/${contact.id}`,
    type: "contact",
  })),
});

const mapLeads = (leads: Lead[], size: number): GlobalSearchGroup => ({
  key: "lead",
  label: "Leads",
  items: take(leads, size).map((lead) => ({
    id: String(lead.id),
    title: lead.contactName,
    subtitle: [lead.companyName, lead.status].filter(Boolean).join(" • "),
    href: `/leads/${lead.id}`,
    type: "lead",
  })),
});

const mapOpportunities = (opportunities: Opportunity[], size: number): GlobalSearchGroup => ({
  key: "opportunity",
  label: "Opportunities",
  items: take(opportunities, size).map((opportunity) => ({
    id: String(opportunity.id),
    title: opportunity.name,
    subtitle: [opportunity.stageName, opportunity.teamName].filter(Boolean).join(" • "),
    href: `/opportunities/${opportunity.id}`,
    type: "opportunity",
  })),
});

const mapUsers = (users: User[], size: number): GlobalSearchGroup => ({
  key: "user",
  label: "Users",
  items: take(users, size).map((user) => ({
    id: String(user.id),
    title: `${user.firstName} ${user.lastName}`.trim(),
    subtitle: [toRoleLabel(user.role), user.email].filter(Boolean).join(" • "),
    href: `/users/${user.id}`,
    type: "user",
  })),
});

const mapTeams = (teams: SalesTeam[], size: number): GlobalSearchGroup => ({
  key: "team",
  label: "Teams",
  items: take(teams, size).map((team) => ({
    id: String(team.id),
    title: team.name,
    subtitle: `${team.memberCount} members`,
    href: `/teams/${team.id}`,
    type: "team",
  })),
});

const mapActivities = (activities: Activity[], size: number): GlobalSearchGroup => ({
  key: "activity",
  label: "Activities",
  items: take(activities, size).map((activity) => {
    const destination =
      activity.opportunityId !== null
        ? `/opportunities/${activity.opportunityId}`
        : activity.leadId !== null
          ? `/leads/${activity.leadId}`
          : "/activities";

    return {
      id: String(activity.id),
      title: activity.title,
      subtitle: [activity.type, activity.assignedToName].filter(Boolean).join(" • "),
      href: destination,
      type: "activity" as const,
    };
  }),
});

export const globalSearchService = {
  search: async ({
    query,
    currentUser,
    limitPerGroup = DEFAULT_LIMIT_PER_GROUP,
  }: GlobalSearchParams): Promise<GlobalSearchResult> => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) {
      return { groups: [] };
    }

    const [contactsResult, leadsResult, opportunitiesResult, usersResult, teamsResult, activitiesResult] =
      await Promise.allSettled([
        contactService.search(query),
        leadService.getAll({ search: query, page: 0, size: limitPerGroup }),
        opportunityService.getAll({ search: query, page: 0, size: limitPerGroup }),
        userService.getAll(0, 100),
        teamService.getAll(),
        activityService.getAll({ page: 0, size: 50 }),
      ]);

    const contacts = contactsResult.status === "fulfilled" ? contactsResult.value : [];
    const leads = leadsResult.status === "fulfilled" ? leadsResult.value.content ?? [] : [];
    const opportunities =
      opportunitiesResult.status === "fulfilled" ? opportunitiesResult.value.content ?? [] : [];

    const usersRaw = usersResult.status === "fulfilled" ? usersResult.value.content ?? [] : [];
    const users = filterUsersByScope(usersRaw, currentUser).filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      return (
        includesQuery(fullName, normalizedQuery) ||
        includesQuery(user.email, normalizedQuery) ||
        includesQuery(user.role, normalizedQuery) ||
        includesQuery(user.teamName, normalizedQuery)
      );
    });

    const teamsRaw = teamsResult.status === "fulfilled" ? teamsResult.value : [];
    const teams = teamsRaw.filter((team) => includesQuery(team.name, normalizedQuery));

    const activitiesRaw = activitiesResult.status === "fulfilled" ? activitiesResult.value.content ?? [] : [];
    const activities = activitiesRaw.filter((activity) => {
      return (
        includesQuery(activity.title, normalizedQuery) ||
        includesQuery(activity.note, normalizedQuery) ||
        includesQuery(activity.opportunityName, normalizedQuery) ||
        includesQuery(activity.leadName, normalizedQuery) ||
        includesQuery(activity.assignedToName, normalizedQuery)
      );
    });

    const groups: GlobalSearchGroup[] = [
      mapUsers(users, limitPerGroup),
      mapContacts(contacts, limitPerGroup),
      mapLeads(leads, limitPerGroup),
      mapOpportunities(opportunities, limitPerGroup),
      mapTeams(teams, limitPerGroup),
      mapActivities(activities, limitPerGroup),
    ].filter((group) => group.items.length > 0);

    return { groups };
  },
};
