<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">{{ t("adminUsers.usersList.title") }}</h2>
      <UButton @click="isCreateDialogOpen = true">
        {{ t("adminUsers.usersList.addUserButton") }}
      </UButton>
    </div>

    <UTable :data="users" :columns="columns" :loading="pending">
      <template #isActive-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'error'">
          {{
            row.original.isActive
              ? t("common.status.active")
              : t("common.status.inactive")
          }}
        </UBadge>
      </template>

      <template #tagIds-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="tagId in row.original.tagIds"
            :key="`${row.original._id}-${tagId}`"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ getTagName(tagId) }}
          </UBadge>
          <span v-if="!row.original.tagIds?.length" class="text-xs text-muted">
            {{ t("common.labels.noValue") }}
          </span>
        </div>
      </template>

      <template #description-cell="{ row }">
        <span v-if="!row.original.description" class="text-xs text-muted">
          {{ t("common.labels.noValue") }}
        </span>
        <UTooltip v-else :text="row.original.description">
          <p class="max-w-56 truncate text-sm text-toned">
            {{ row.original.description }}
          </p>
        </UTooltip>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex space-x-2">
          <UButton
            variant="ghost"
            icon="i-heroicons-clipboard-document-list"
            :title="t('adminUsers.usersList.actions.copySubscriptionUrl')"
            :loading="copyingUrlUserId === row.original._id"
            @click="copySubscriptionUrl(row.original)"
          />
          <UButton
            variant="ghost"
            icon="i-heroicons-eye"
            :title="t('adminUsers.usersList.actions.previewSubscription')"
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
            :title="
              row.original.isActive
                ? t('adminUsers.usersList.actions.deactivateUser')
                : t('adminUsers.usersList.actions.activateUser')
            "
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
      :title="t('adminUsers.usersList.createModal.title')"
      :description="t('adminUsers.usersList.createModal.description')"
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">
            {{ t("adminUsers.usersList.createModal.heading") }}
          </h3>
          <form class="w-full space-y-4" @submit.prevent="createUser">
            <UFormField
              :label="t('adminUsers.usersList.createModal.labelField')"
              class="w-full"
            >
              <UInput v-model="newUser.label" class="w-full" required />
            </UFormField>
            <UFormField
              :label="t('adminUsers.usersList.createModal.emailField')"
              class="w-full"
            >
              <UInput v-model="newUser.email" class="w-full" type="email" />
            </UFormField>
            <UFormField
              :label="t('adminUsers.usersList.createModal.descriptionField')"
              class="w-full"
            >
              <UTextarea
                v-model="newUser.description"
                class="w-full"
                :rows="3"
                :maxlength="500"
                :placeholder="
                  t('adminUsers.usersList.createModal.descriptionPlaceholder')
                "
              />
            </UFormField>
            <UFormField
              :label="t('adminUsers.usersList.createModal.tagsField')"
              class="w-full"
            >
              <UInputMenu
                v-model="newUser.tagIds"
                :items="tags"
                label-key="name"
                value-key="_id"
                :multiple="true"
                :placeholder="
                  t('adminUsers.usersList.createModal.tagsPlaceholder')
                "
                class="w-full"
              />
              <p class="mt-1 text-xs text-muted">
                {{ t("adminUsers.usersList.createModal.tagsHint") }}
              </p>
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton variant="ghost" @click="isCreateDialogOpen = false">
                {{ t("common.actions.cancel") }}
              </UButton>
              <UButton type="submit" :loading="creating">
                {{ t("common.actions.create") }}
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="previewModalOpen"
      :title="
        t('adminUsers.usersList.previewModal.title', {
          label:
            previewTargetLabel ||
            t('adminUsers.usersList.previewModal.userFallback'),
        })
      "
      :description="t('adminUsers.usersList.previewModal.description')"
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
                  {{ t("adminUsers.usersList.previewModal.uniqueNodes") }}
                </p>
                <p class="mt-1 text-xl font-semibold">
                  {{ previewData.stats.uniqueNodes }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  {{ t("adminUsers.usersList.previewModal.rawNodes") }}
                </p>
                <p class="mt-1 text-xl font-semibold">
                  {{ previewData.stats.totalRawNodes }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  {{ t("adminUsers.usersList.previewModal.upstreams") }}
                </p>
                <p class="mt-1 text-xl font-semibold">
                  {{ previewData.stats.upstreams }}
                </p>
              </UCard>
            </div>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold">
                    {{ t("adminUsers.usersList.previewModal.firstNodes") }}
                  </h4>
                  <UButton
                    v-if="previewTargetId"
                    :to="`/admin/users/${previewTargetId}`"
                    size="xs"
                    variant="soft"
                  >
                    {{ t("adminUsers.usersList.previewModal.openFullPage") }}
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
      :title="t('adminUsers.usersList.deleteDialog.title')"
      :description="t('adminUsers.usersList.deleteDialog.description')"
      :confirm-label="t('adminUsers.usersList.deleteDialog.confirmLabel')"
      confirm-color="error"
      :loading="deletingUser"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { FetchError } from "ofetch";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import type { TagItem } from "~/modules/AdminUsers/types/tags";
import type {
  CreateUserInput,
  UserItem,
  UserSubscriptionPreview,
} from "~/modules/AdminUsers/types/users";
import { listTagsApi } from "~/modules/AdminUsers/utils/tagsApi";
import {
  createUserApi,
  deleteUserApi,
  getUserApi,
  listUsersApi,
  previewUserSubscriptionApi,
  updateUserApi,
} from "~/modules/AdminUsers/utils/usersApi";

const { t } = useI18n();

const columns = computed(() => [
  { accessorKey: "label", header: t("adminUsers.usersList.columns.name") },
  { accessorKey: "email", header: t("adminUsers.usersList.columns.email") },
  {
    accessorKey: "description",
    header: t("adminUsers.usersList.columns.description"),
  },
  { accessorKey: "tagIds", header: t("adminUsers.usersList.columns.tags") },
  {
    accessorKey: "isActive",
    header: t("adminUsers.usersList.columns.status"),
  },
  {
    accessorKey: "actions",
    header: t("adminUsers.usersList.columns.actions"),
  },
]);

const requestHeaders = import.meta.server
  ? useRequestHeaders(["cookie"])
  : undefined;

const { data, status, refresh } = useAsyncData<UserItem[]>(
  "admin-users-list",
  () => listUsersApi({ headers: requestHeaders }),
  {
    default: (): UserItem[] => [],
  },
);

const { data: tagsData, status: tagsStatus } = useAsyncData<TagItem[]>(
  "admin-users-tags",
  () => listTagsApi(requestHeaders),
  {
    default: (): TagItem[] => [],
  },
);

const tags = computed<TagItem[]>(() => tagsData.value);
const users = computed<UserItem[]>(() => data.value);
const pending = computed(
  () => status.value === "pending" || tagsStatus.value === "pending",
);

const toast = useToast();
const runtimeConfig = useRuntimeConfig();

const isCreateDialogOpen = ref(false);
const creating = ref(false);
const newUser = ref<CreateUserInput>({
  label: "",
  email: "",
  description: "",
  tagIds: [],
});

const previewModalOpen = ref(false);
const previewData = ref<UserSubscriptionPreview | null>(null);
const previewTargetId = ref<string | null>(null);
const previewTargetLabel = ref("");
const previewingUserId = ref<string | null>(null);
const copyingUrlUserId = ref<string | null>(null);

const togglingUserId = ref<string | null>(null);

const deleteDialogOpen = ref(false);
const deletingUserId = ref<string | null>(null);
const deletingUser = ref(false);

const tagNameMap = computed<Map<string, string>>(() => {
  return new Map(tags.value.map((tag) => [tag._id, tag.name]));
});

const getTagName = (tagId: string): string => {
  return tagNameMap.value.get(tagId) || t("common.labels.unknownTag");
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || !error) {
    return t("common.errors.unexpected");
  }

  const candidate = error as FetchError;
  const message =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as { message?: string }).message
      : undefined;

  return message || candidate.message || t("common.errors.unexpected");
};

const normalizeBaseUrl = (value: string): string => {
  return value.trim().replace(/\/+$/, "");
};

const isPrivateIpv4Host = (hostname: string): boolean => {
  const octets = hostname.split(".");
  if (octets.length !== 4) {
    return false;
  }

  const values = octets.map((octet) => Number.parseInt(octet, 10));
  if (values.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }

  const first = values[0];
  const second = values[1];
  if (first === undefined || second === undefined) {
    return false;
  }

  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

const isPrivateIpv6Host = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
};

const shouldUseHttpSubscriptionUrl = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".test") ||
    isPrivateIpv4Host(normalized) ||
    isPrivateIpv6Host(normalized)
  );
};

const buildSubscriptionUrl = (token: string): string => {
  const configuredBaseUrl = normalizeBaseUrl(
    runtimeConfig.public.subscriptionBaseUrl,
  );
  if (configuredBaseUrl) {
    return `${configuredBaseUrl}/subs/${token}`;
  }

  if (import.meta.client) {
    if (shouldUseHttpSubscriptionUrl(window.location.hostname)) {
      return `http://${window.location.hostname}/subs/${token}`;
    }

    return `${window.location.origin}/subs/${token}`;
  }

  return `/subs/${token}`;
};

const createUser = async () => {
  creating.value = true;
  try {
    await createUserApi(newUser.value);
    isCreateDialogOpen.value = false;
    newUser.value = { label: "", email: "", description: "", tagIds: [] };
    await refresh();
    toast.add({
      title: t("adminUsers.usersList.toasts.userCreated"),
      description: t("adminUsers.usersList.toasts.tokenGenerated"),
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    creating.value = false;
  }
};

const copySubscriptionUrl = async (user: UserItem) => {
  copyingUrlUserId.value = user._id;
  try {
    const userWithToken = await getUserApi(user._id);
    if (!userWithToken.token) {
      throw createError({
        statusCode: 400,
        statusMessage: t("adminUsers.errors.userHasNoActiveToken"),
      });
    }

    await navigator.clipboard.writeText(
      buildSubscriptionUrl(userWithToken.token),
    );
    toast.add({
      title: t("adminUsers.usersList.toasts.subscriptionUrlCopied"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("adminUsers.usersList.toasts.copyFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    copyingUrlUserId.value = null;
  }
};

const previewFromList = async (user: UserItem) => {
  previewTargetId.value = user._id;
  previewTargetLabel.value =
    user.label || t("adminUsers.usersList.previewModal.userFallback");
  previewData.value = null;
  previewModalOpen.value = true;
  previewingUserId.value = user._id;

  try {
    previewData.value = await previewUserSubscriptionApi(user._id);
  } catch (error) {
    previewModalOpen.value = false;
    toast.add({
      title: t("adminUsers.usersList.toasts.previewFailed"),
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
      title: nextState
        ? t("adminUsers.usersList.toasts.userActivated")
        : t("adminUsers.usersList.toasts.userDeactivated"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("adminUsers.usersList.toasts.statusUpdateFailed"),
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
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    deletingUser.value = false;
  }
};
</script>
