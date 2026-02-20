import type { FetchError } from "ofetch";
import type { AdminUser, LoginInput } from "~/modules/AdminAuth/types/auth";
import {
  fetchMeApi,
  loginApi,
  logoutApi,
  refreshSessionApi,
  revokeSessionApi,
} from "~/modules/AdminAuth/utils/authApi";

const isUnauthorizedError = (error: unknown): boolean => {
  if (typeof error !== "object" || !error) {
    return false;
  }

  const candidate = error as FetchError;
  return candidate.status === 401 || candidate.statusCode === 401;
};

export const useAdminAuth = () => {
  const user = useState<AdminUser | null>("admin-auth-user", () => null);

  const requestMe = async () => {
    if (import.meta.server) {
      const headers = useRequestHeaders(["cookie"]);
      return fetchMeApi(headers);
    }
    return fetchMeApi();
  };

  const fetchUser = async () => {
    try {
      const data = await requestMe();
      user.value = data.user;
      return;
    } catch (error) {
      if (import.meta.client && isUnauthorizedError(error)) {
        try {
          await refreshSessionApi();
          const retried = await requestMe();
          user.value = retried.user;
          return;
        } catch {
          user.value = null;
          return;
        }
      }
      user.value = null;
    }
  };

  const login = async (payload: LoginInput) => {
    await loginApi(payload);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await revokeSessionApi();
    } catch {
      await logoutApi();
    }

    user.value = null;
    await navigateTo("/admin/login");
  };

  return {
    user,
    login,
    logout,
    fetchUser,
  };
};
