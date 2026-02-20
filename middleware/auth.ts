import type { AdminUser } from "~/modules/AdminAuth/types/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) {
    return;
  }

  const isLoginRoute = to.path === "/admin/login";

  // Server-side: only trust access token here.
  // Refresh token is intentionally scoped to /refresh-token and cannot be read on /admin/*
  // requests, so hard redirects on missing access token would break valid refresh sessions.
  if (import.meta.server) {
    const event = useRequestEvent();
    const authState = useState<AdminUser | null>("admin-auth-user", () => null);

    if (event) {
      const { getAdminUserFromAccessToken } =
        await import("~/server/utils/admin-auth");
      const user = getAdminUserFromAccessToken(event);
      authState.value = user;
      const isAuthenticated = Boolean(user);

      if (isAuthenticated && isLoginRoute) {
        return navigateTo("/admin/users");
      }

      return;
    }

    return;
  }

  // Client-side: keep auth state in sync for SPA navigations.
  const { user, fetchUser } = useAuth();

  if (!user.value) {
    await fetchUser();
  }

  if (!user.value && !isLoginRoute) {
    return navigateTo("/admin/login");
  }

  if (user.value && isLoginRoute) {
    return navigateTo("/admin/users");
  }
});
