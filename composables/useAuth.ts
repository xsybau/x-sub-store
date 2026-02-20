import { useAdminAuth } from "~/modules/AdminAuth/composables/useAdminAuth";

export const useAuth = () => {
  return useAdminAuth();
};
