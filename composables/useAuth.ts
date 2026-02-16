export const useAuth = () => {
  const user = useState<any>("user", () => null);

  const login = async (body: any) => {
    await $fetch("/api/admin/auth/login", {
      method: "POST",
      body,
    });
    await fetchUser();
  };

  const logout = async () => {
    try {
      await $fetch("/refresh-token", { method: "DELETE" });
    } catch {
      await $fetch("/api/admin/auth/logout", { method: "POST" });
    }
    user.value = null;
    navigateTo("/admin/login");
  };

  const requestMe = async () => {
    if (process.server) {
      const headers = useRequestHeaders(["cookie"]);
      return await $fetch("/api/admin/me", { headers });
    }
    return await $fetch("/api/admin/me");
  };

  const fetchUser = async () => {
    try {
      const data: any = await requestMe();
      user.value = data?.user || null;
      return;
    } catch (e: any) {
      if (process.client && (e?.status === 401 || e?.statusCode === 401)) {
        try {
          await $fetch("/refresh-token", { method: "POST" });
          const retried: any = await requestMe();
          user.value = retried?.user || null;
          return;
        } catch {
          // fallthrough to null state
        }
      }
      user.value = null;
    }
  };

  return { user, login, logout, fetchUser };
};
