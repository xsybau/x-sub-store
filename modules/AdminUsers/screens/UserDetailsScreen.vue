<template>
  <div v-if="user">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold">{{ user.label }}</h2>
        <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle">
          {{ user.isActive ? "Active" : "Inactive" }}
        </UBadge>
      </div>

      <div class="flex space-x-2">
        <UButton variant="soft" :loading="previewLoading" @click="preview"
          >Preview Subscription</UButton
        >
        <UButton
          variant="soft"
          :color="user.isActive ? 'warning' : 'success'"
          :loading="togglingStatus"
          :icon="
            user.isActive
              ? 'i-heroicons-pause-circle'
              : 'i-heroicons-play-circle'
          "
          @click="toggleUserStatus"
        >
          {{ user.isActive ? "Deactivate" : "Activate" }}
        </UButton>
        <UButton color="error" @click="deleteDialogOpen = true"
          >Delete User</UButton
        >
      </div>
    </div>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">Subscription URL</h3>
      </template>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <UTooltip :text="subUrl">
          <p
            class="min-w-0 flex-1 truncate rounded-md border border-accented/60 bg-muted/30 px-3 py-2 font-mono text-xs text-toned"
          >
            {{ subUrl }}
          </p>
        </UTooltip>

        <div class="flex gap-2">
          <UButton icon="i-heroicons-clipboard" @click="copyUrl">Copy</UButton>
          <UButton
            color="warning"
            icon="i-heroicons-arrow-path"
            @click="rotateDialogOpen = true"
            >Rotate Token</UButton
          >
        </div>
      </div>

      <p class="mt-2 font-mono text-xs text-gray-500">
        Token: {{ user.token }}
      </p>
    </UCard>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">User Upstreams</h3>
        </template>
        <UpstreamManager scope="USER" :user-id="user._id" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">User Static Nodes</h3>
        </template>
        <StaticNodeManager scope="USER" :user-id="user._id" />
      </UCard>
    </div>

    <UModal
      v-model:open="showPreview"
      fullscreen
      title="Subscription Preview"
      description="Inspect generated nodes and upstream status for this user."
    >
      <template #content>
        <div class="flex h-full flex-col p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold">Subscription Preview</h3>
            <UButton
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="showPreview = false"
            />
          </div>

          <div v-if="previewLoading" class="flex-1 space-y-3">
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-24 w-full" />
            <USkeleton class="h-64 w-full" />
          </div>

          <div v-else-if="previewData" class="flex-1 space-y-4 overflow-auto">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <UCard>
                <h4 class="font-bold text-gray-500">Total Nodes</h4>
                <p class="text-2xl">{{ previewData.stats.uniqueNodes }}</p>
              </UCard>
              <UCard>
                <h4 class="font-bold text-gray-500">Raw Nodes</h4>
                <p class="text-2xl">{{ previewData.stats.totalRawNodes }}</p>
              </UCard>
              <UCard>
                <h4 class="font-bold text-gray-500">Upstreams</h4>
                <p class="text-2xl">{{ previewData.stats.upstreams }}</p>
              </UCard>
            </div>

            <UCard>
              <template #header>
                <h4 class="font-bold">Upstream Status</h4>
              </template>
              <UTable
                class="table-fixed"
                :data="previewData.upstreamStatus"
                :columns="previewStatusColumns"
              >
                <template #source-cell="{ row }">
                  <UTooltip :text="row.original.source">
                    <p class="max-w-40 truncate font-medium sm:max-w-56">
                      {{ row.original.source }}
                    </p>
                  </UTooltip>
                </template>

                <template #status-cell="{ row }">
                  <UBadge
                    :color="row.original.status === 'OK' ? 'success' : 'error'"
                    variant="subtle"
                  >
                    {{ row.original.status === "OK" ? "Healthy" : "Issue" }}
                  </UBadge>
                </template>

                <template #error-cell="{ row }">
                  <span v-if="!row.original.error" class="text-xs text-muted"
                    >-</span
                  >
                  <UTooltip v-else :text="row.original.error">
                    <p
                      class="max-w-44 truncate font-mono text-xs text-error sm:max-w-[18rem]"
                    >
                      {{ row.original.error }}
                    </p>
                  </UTooltip>
                </template>
              </UTable>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex justify-between">
                  <h4 class="font-bold">Nodes</h4>
                  <UButton size="xs" @click="copyNodes">Copy</UButton>
                </div>
              </template>
              <pre
                class="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-800"
                >{{ previewData.nodes.join("\n") }}</pre
              >
            </UCard>
          </div>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="rotateDialogOpen"
      title="Rotate User Token"
      description="This will invalidate the current subscription URL and issue a new one."
      confirm-label="Rotate Token"
      confirm-color="warning"
      :loading="rotatingToken"
      @confirm="rotateToken"
    />

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete User"
      description="This will permanently remove the user and all of their data."
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
import StaticNodeManager from "~/modules/AdminSources/components/StaticNodeManager.vue";
import UpstreamManager from "~/modules/AdminSources/components/UpstreamManager.vue";
import type {
  UserSubscriptionPreview,
  UserWithToken,
} from "~/modules/AdminUsers/types/users";
import {
  deleteUserApi,
  getUserApi,
  previewUserSubscriptionApi,
  rotateUserTokenApi,
  updateUserApi,
} from "~/modules/AdminUsers/utils/usersApi";

const route = useRoute();
const toast = useToast();

const userId = computed(() => {
  const value = route.params.id;
  return typeof value === "string" ? value : "";
});

const { data: user, refresh } = useAsyncData<UserWithToken | null>(
  () => `admin-user-${userId.value}`,
  async () => {
    if (!userId.value) {
      throw createError({ statusCode: 400, statusMessage: "Invalid user id" });
    }
    return getUserApi(userId.value);
  },
  {
    server: false,
    watch: [userId],
    default: () => null,
  },
);

const userPageTitle = computed(() => {
  const label = user.value?.label.trim();
  return label ? `${label} - Users` : "Users";
});

useHead(() => ({
  title: userPageTitle.value,
}));

const showPreview = ref(false);
const previewData = ref<UserSubscriptionPreview | null>(null);
const previewLoading = ref(false);
const rotateDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const rotatingToken = ref(false);
const togglingStatus = ref(false);
const deletingUser = ref(false);

const previewStatusColumns = [
  { accessorKey: "source", header: "Upstream" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "error", header: "Error" },
];

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

const subUrl = computed(() => {
  if (!user.value) {
    return "";
  }

  const token = user.value.token;
  if (!token) {
    return "";
  }

  if (import.meta.client) {
    return `${window.location.origin}/subs/${token}`;
  }

  return `/subs/${token}`;
});

const copyUrl = async () => {
  await navigator.clipboard.writeText(subUrl.value);
  toast.add({ title: "Copied", color: "success" });
};

const copyNodes = async () => {
  if (!previewData.value?.nodes) {
    return;
  }

  await navigator.clipboard.writeText(previewData.value.nodes.join("\n"));
  toast.add({ title: "Copied Nodes", color: "success" });
};

const rotateToken = async () => {
  if (!userId.value) {
    return;
  }

  rotatingToken.value = true;
  try {
    await rotateUserTokenApi(userId.value);
    await refresh();
    rotateDialogOpen.value = false;
    toast.add({ title: "Token Rotated", color: "success" });
  } catch (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    rotatingToken.value = false;
  }
};

const toggleUserStatus = async () => {
  if (!user.value || !userId.value) {
    return;
  }

  togglingStatus.value = true;
  const nextState = !user.value.isActive;

  try {
    await updateUserApi(userId.value, {
      isActive: nextState,
    });
    await refresh();
    toast.add({
      title: nextState ? "User activated" : "User deactivated",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    togglingStatus.value = false;
  }
};

const deleteUser = async () => {
  if (!userId.value) {
    return;
  }

  deletingUser.value = true;
  try {
    await deleteUserApi(userId.value);
    deleteDialogOpen.value = false;
    await navigateTo("/admin/users");
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

const preview = async () => {
  if (!userId.value) {
    return;
  }

  previewLoading.value = true;
  showPreview.value = true;
  previewData.value = null;

  try {
    previewData.value = await previewUserSubscriptionApi(userId.value);
  } catch (error) {
    showPreview.value = false;
    toast.add({
      title: "Preview Failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    previewLoading.value = false;
  }
};
</script>
