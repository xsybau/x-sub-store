<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Users</h2>
      <UButton @click="isCreateDialogOpen = true">Add User</UButton>
    </div>

    <UTable :data="users" :columns="columns" :loading="pending">
      <template #isActive-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'error'">
          {{ row.original.isActive ? "Active" : "Inactive" }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex space-x-2">
          <UButton
            variant="ghost"
            icon="i-heroicons-eye"
            title="Preview Subscription"
            :loading="previewingUserId === row.original._id"
            @click="previewFromList(row.original)"
          />
          <UButton
            variant="ghost"
            :color="row.original.isActive ? 'warning' : 'success'"
            :icon="
              row.original.isActive
                ? 'i-heroicons-pause-circle'
                : 'i-heroicons-play-circle'
            "
            :loading="togglingUserId === row.original._id"
            :title="row.original.isActive ? 'Deactivate User' : 'Activate User'"
            @click="toggleUserActive(row.original)"
          />
          <UButton
            :to="`/admin/users/${row.original._id}`"
            variant="ghost"
            icon="i-heroicons-pencil-square"
          />
          <UButton
            variant="ghost"
            color="error"
            icon="i-heroicons-trash"
            @click="openDeleteDialog(row.original._id)"
          />
        </div>
      </template>
    </UTable>

    <UModal
      v-model:open="isCreateDialogOpen"
      title="Create User"
      description="Add a new user with an optional email address."
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">Create User</h3>
          <form class="space-y-4" @submit.prevent="createUser">
            <UFormField label="Label">
              <UInput v-model="newUser.label" required />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="newUser.email" type="email" />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton variant="ghost" @click="isCreateDialogOpen = false"
                >Cancel</UButton
              >
              <UButton type="submit" :loading="creating">Create</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="previewModalOpen"
      :title="`Preview: ${previewTargetLabel || 'User'}`"
      description="Quick subscription preview directly from the users table."
    >
      <template #content>
        <div class="space-y-4 p-6">
          <div v-if="previewingUserId" class="space-y-3">
            <USkeleton class="h-5 w-1/3" />
            <USkeleton class="h-20 w-full" />
            <USkeleton class="h-24 w-full" />
          </div>

          <div v-else-if="previewData" class="space-y-4">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  Unique Nodes
                </p>
                <p class="mt-1 text-xl font-semibold">
                  {{ previewData.stats.uniqueNodes }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  Raw Nodes
                </p>
                <p class="mt-1 text-xl font-semibold">
                  {{ previewData.stats.totalRawNodes }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  Upstreams
                </p>
                <p class="mt-1 text-xl font-semibold">
                  {{ previewData.stats.upstreams }}
                </p>
              </UCard>
            </div>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold">First Nodes</h4>
                  <UButton
                    v-if="previewTargetId"
                    :to="`/admin/users/${previewTargetId}`"
                    size="xs"
                    variant="soft"
                  >
                    Open Full Page
                  </UButton>
                </div>
              </template>
              <pre
                class="max-h-56 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-800"
                >{{ (previewData.nodes || []).slice(0, 8).join("\n") }}</pre
              >
            </UCard>
          </div>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete User"
      description="This will permanently delete the user and all related data."
      confirm-label="Delete User"
      confirm-color="error"
      :loading="deletingUser"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from "ofetch";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import type {
  CreateUserInput,
  UserItem,
  UserSubscriptionPreview,
} from "~/modules/AdminUsers/types/users";
import {
  createUserApi,
  deleteUserApi,
  listUsersApi,
  previewUserSubscriptionApi,
  updateUserApi,
} from "~/modules/AdminUsers/utils/usersApi";

const columns = [
  { accessorKey: "label", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "isActive", header: "Status" },
  { accessorKey: "actions", header: "Actions" },
];

const { data, status, refresh } = useAsyncData(
  "admin-users-list",
  listUsersApi,
  {
    server: false,
    default: () => [],
  },
);

const users = computed<UserItem[]>(() => data.value);
const pending = computed(() => status.value === "pending");

const toast = useToast();

const isCreateDialogOpen = ref(false);
const creating = ref(false);
const newUser = ref<CreateUserInput>({ label: "", email: "" });

const previewModalOpen = ref(false);
const previewData = ref<UserSubscriptionPreview | null>(null);
const previewTargetId = ref<string | null>(null);
const previewTargetLabel = ref("");
const previewingUserId = ref<string | null>(null);

const togglingUserId = ref<string | null>(null);

const deleteDialogOpen = ref(false);
const deletingUserId = ref<string | null>(null);
const deletingUser = ref(false);

const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || !error) {
    return "Unexpected error";
  }

  const candidate = error as FetchError;
  const message =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as { message?: string }).message
      : undefined;

  return message || candidate.message || "Unexpected error";
};

const createUser = async () => {
  creating.value = true;
  try {
    await createUserApi(newUser.value);
    isCreateDialogOpen.value = false;
    newUser.value = { label: "", email: "" };
    await refresh();
    toast.add({
      title: "User created",
      description: "Token generated successfully",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    creating.value = false;
  }
};

const previewFromList = async (user: UserItem) => {
  previewTargetId.value = user._id;
  previewTargetLabel.value = user.label || "User";
  previewData.value = null;
  previewModalOpen.value = true;
  previewingUserId.value = user._id;

  try {
    previewData.value = await previewUserSubscriptionApi(user._id);
  } catch (error) {
    previewModalOpen.value = false;
    toast.add({
      title: "Preview Failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    previewingUserId.value = null;
  }
};

const openDeleteDialog = (id: string) => {
  deletingUserId.value = id;
  deleteDialogOpen.value = true;
};

const toggleUserActive = async (user: UserItem) => {
  togglingUserId.value = user._id;
  const nextState = !user.isActive;

  try {
    await updateUserApi(user._id, {
      isActive: nextState,
    });
    await refresh();
    toast.add({
      title: nextState ? "User activated" : "User deactivated",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Status update failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    togglingUserId.value = null;
  }
};

const deleteUser = async () => {
  if (!deletingUserId.value) {
    return;
  }

  deletingUser.value = true;
  try {
    await deleteUserApi(deletingUserId.value);
    await refresh();
    deleteDialogOpen.value = false;
    deletingUserId.value = null;
  } catch (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    deletingUser.value = false;
  }
};
</script>
