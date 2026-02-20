import type {
  CreateUserInput,
  CreateUserResponse,
  UpdateUserInput,
  UserItem,
  UserSubscriptionPreview,
  UserWithToken,
} from "~/modules/AdminUsers/types/users";

export const listUsersApi = async (
  headers?: HeadersInit,
): Promise<UserItem[]> => {
  return $fetch("/api/admin/users", { headers });
};

export const createUserApi = async (
  input: CreateUserInput,
): Promise<CreateUserResponse> => {
  return $fetch("/api/admin/users", {
    method: "POST",
    body: input,
  });
};

export const getUserApi = async (id: string): Promise<UserWithToken> => {
  return $fetch(`/api/admin/users/${id}`);
};

export const updateUserApi = async (
  id: string,
  input: UpdateUserInput,
): Promise<UserWithToken> => {
  return $fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    body: input,
  });
};

export const deleteUserApi = async (
  id: string,
): Promise<{ success: boolean }> => {
  return $fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
};

export const rotateUserTokenApi = async (
  id: string,
): Promise<{ token: string }> => {
  return $fetch(`/api/admin/users/${id}/rotate-token`, {
    method: "POST",
  });
};

export const previewUserSubscriptionApi = async (
  id: string,
): Promise<UserSubscriptionPreview> => {
  return $fetch(`/api/admin/users/${id}/preview`);
};
