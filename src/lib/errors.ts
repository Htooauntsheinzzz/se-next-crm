import axios from "axios";

interface MessagePayload {
  message?: string;
}

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as MessagePayload | undefined)?.message;
    return message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
