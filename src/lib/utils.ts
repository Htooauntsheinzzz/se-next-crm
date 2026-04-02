import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";

export const formatCurrency = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export const formatDateLabel = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return format(date, "MMM dd, yyyy");
};

export const formatRelativeTime = (value: string | null | undefined) => {
  if (!value) {
    return "just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  return formatDistanceToNow(date, { addSuffix: true });
};

export const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "U";
};

export const roleToLabel = (role: string | null | undefined) => {
  if (!role) {
    return "Unknown";
  }

  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

interface ApiErrorShape {
  message?: string;
}

export const getApiMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Connection failed. Please try again.";
    }

    const payload = error.response.data as ApiErrorShape | undefined;
    return payload?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const mergeClassNames = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");
