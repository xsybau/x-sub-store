import type { LoginInput, MeResponse } from "~/modules/AdminAuth/types/auth";

export const loginApi = async (
  body: LoginInput,
): Promise<{ success: boolean }> => {
  return $fetch("/api/admin/auth/login", {
    method: "POST",
    body,
  });
};

export const logoutApi = async (): Promise<{ success: boolean }> => {
  return $fetch("/api/admin/auth/logout", {
    method: "POST",
  });
};

export const revokeSessionApi = async (): Promise<{ success: boolean }> => {
  return $fetch("/refresh-token", {
    method: "DELETE",
  });
};

export const refreshSessionApi = async (): Promise<{ success: boolean }> => {
  return $fetch("/refresh-token", {
    method: "POST",
  });
};

export const fetchMeApi = async (
  headers?: HeadersInit,
): Promise<MeResponse> => {
  return $fetch("/api/admin/me", { headers });
};
