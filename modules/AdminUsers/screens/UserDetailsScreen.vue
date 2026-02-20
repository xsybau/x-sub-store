<template>
  <div v-if="user">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold">{{ user.label }}</h2>
        <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle">
          {{
            user.isActive
              ? t("common.status.active")
              : t("common.status.inactive")
          }}
        </UBadge>
      </div>

      <div class="flex space-x-2">
        <UButton variant="soft" :loading="previewLoading" @click="preview">
          {{ t("adminUsers.userDetails.previewSubscriptionButton") }}
        </UButton>
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
          {{
            user.isActive
              ? t("adminUsers.userDetails.deactivateButton")
              : t("adminUsers.userDetails.activateButton")
          }}
        </UButton>
        <UButton color="error" @click="deleteDialogOpen = true">
          {{ t("adminUsers.userDetails.deleteUserButton") }}
        </UButton>
      </div>
    </div>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">
          {{ t("adminUsers.userDetails.cards.adminNotes") }}
        </h3>
      </template>

      <div class="space-y-3">
        <UFormField
          :label="t('adminUsers.userDetails.fields.descriptionAdminOnly')"
        >
          <UTextarea
            v-model="editableDescription"
            class="w-full"
            :rows="4"
            :maxlength="500"
            :placeholder="
              t('adminUsers.userDetails.fields.descriptionPlaceholder')
            "
          />
        </UFormField>

        <div class="flex items-center justify-between">
          <p class="text-xs text-muted">
            {{ t("adminUsers.userDetails.notes.adminOnlyVisibility") }}
          </p>
          <UButton
            size="sm"
            :loading="savingDescription"
            :disabled="!isDescriptionDirty"
            @click="saveDescription"
          >
            {{ t("adminUsers.userDetails.buttons.saveDescription") }}
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">
          {{ t("adminUsers.userDetails.cards.userTags") }}
        </h3>
      </template>

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="tagId in editableTagIds"
            :key="`selected-tag-${tagId}`"
            color="neutral"
            variant="subtle"
          >
            {{ getTagName(tagId) }}
          </UBadge>
          <span v-if="!editableTagIds.length" class="text-sm text-muted">
            {{ t("common.labels.noValue") }}
          </span>
        </div>

        <UFormField :label="t('adminUsers.userDetails.fields.assignedTags')">
          <UInputMenu
            v-model="editableTagIds"
            :items="tags"
            label-key="name"
            value-key="_id"
            :multiple="true"
            :placeholder="
              t('adminUsers.userDetails.fields.userTagsPlaceholder')
            "
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <p class="text-xs text-muted">
            {{ tagSaveStatusText }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">
          {{ t("adminUsers.userDetails.cards.subscriptionUrl") }}
        </h3>
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
          <UButton icon="i-heroicons-clipboard" @click="copyUrl">
            {{ t("adminUsers.userDetails.buttons.copy") }}
          </UButton>
          <UButton
            color="warning"
            icon="i-heroicons-arrow-path"
            @click="rotateDialogOpen = true"
          >
            {{ t("adminUsers.userDetails.buttons.rotateToken") }}
          </UButton>
        </div>
      </div>

      <p class="mt-2 font-mono text-xs text-gray-500">
        {{
          t("adminUsers.userDetails.fields.tokenLabel", {
            token: user.token || "",
          })
        }}
      </p>
    </UCard>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ t("adminUsers.userDetails.cards.userUpstreams") }}
          </h3>
        </template>
        <UpstreamManager scope="USER" :user-id="user._id" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ t("adminUsers.userDetails.cards.userStaticNodes") }}
          </h3>
        </template>
        <StaticNodeManager scope="USER" :user-id="user._id" />
      </UCard>
    </div>

    <UModal
      v-model:open="showPreview"
      fullscreen
      :title="t('adminUsers.userDetails.previewModal.title')"
      :description="t('adminUsers.userDetails.previewModal.description')"
    >
      <template #content>
        <div class="flex h-full flex-col p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-xl font-bold">
              {{ t("adminUsers.userDetails.previewModal.heading") }}
            </h3>
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
                <h4 class="font-bold text-gray-500">
                  {{ t("adminUsers.userDetails.previewModal.totalNodes") }}
                </h4>
                <p class="text-2xl">{{ previewData.stats.uniqueNodes }}</p>
              </UCard>
              <UCard>
                <h4 class="font-bold text-gray-500">
                  {{ t("adminUsers.userDetails.previewModal.rawNodes") }}
                </h4>
                <p class="text-2xl">{{ previewData.stats.totalRawNodes }}</p>
              </UCard>
              <UCard>
                <h4 class="font-bold text-gray-500">
                  {{ t("adminUsers.userDetails.previewModal.upstreams") }}
                </h4>
                <p class="text-2xl">{{ previewData.stats.upstreams }}</p>
              </UCard>
            </div>

            <UCard>
              <template #header>
                <h4 class="font-bold">
                  {{ t("adminUsers.userDetails.previewModal.upstreamStatus") }}
                </h4>
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
                    {{
                      row.original.status === "OK"
                        ? t("common.status.healthy")
                        : t("common.status.issue")
                    }}
                  </UBadge>
                </template>

                <template #error-cell="{ row }">
                  <span v-if="!row.original.error" class="text-xs text-muted">
                    {{ t("common.labels.noValue") }}
                  </span>
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
                  <h4 class="font-bold">
                    {{ t("adminUsers.userDetails.previewModal.nodes") }}
                  </h4>
                  <UButton size="xs" @click="copyNodes">
                    {{ t("adminUsers.userDetails.buttons.copyNodes") }}
                  </UButton>
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
      :title="t('adminUsers.userDetails.rotateDialog.title')"
      :description="t('adminUsers.userDetails.rotateDialog.description')"
      :confirm-label="t('adminUsers.userDetails.rotateDialog.confirmLabel')"
      confirm-color="warning"
      :loading="rotatingToken"
      @confirm="rotateToken"
    />

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :title="t('adminUsers.userDetails.deleteDialog.title')"
      :description="t('adminUsers.userDetails.deleteDialog.description')"
      :confirm-label="t('adminUsers.userDetails.deleteDialog.confirmLabel')"
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
import StaticNodeManager from "~/modules/AdminSources/components/StaticNodeManager.vue";
import UpstreamManager from "~/modules/AdminSources/components/UpstreamManager.vue";
import type { TagItem } from "~/modules/AdminUsers/types/tags";
import type {
  UserSubscriptionPreview,
  UserWithToken,
} from "~/modules/AdminUsers/types/users";
import { listTagsApi } from "~/modules/AdminUsers/utils/tagsApi";
import {
  deleteUserApi,
  getUserApi,
  previewUserSubscriptionApi,
  rotateUserTokenApi,
  updateUserApi,
} from "~/modules/AdminUsers/utils/usersApi";

const route = useRoute();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const { t } = useI18n();

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

const userId = computed(() => {
  const value = route.params.id;
  return typeof value === "string" ? value : "";
});

const { data: user, refresh } = useAsyncData<UserWithToken | null>(
  () => `admin-user-${userId.value}`,
  async () => {
    if (!userId.value) {
      throw createError({
        statusCode: 400,
        statusMessage: t("adminUsers.errors.invalidUserId"),
      });
    }
    return getUserApi(userId.value);
  },
  {
    server: false,
    watch: [userId],
    default: () => null,
  },
);

const { data: tagsData } = useAsyncData<TagItem[]>(
  "admin-user-tags",
  () => listTagsApi(),
  {
    server: false,
    default: (): TagItem[] => [],
  },
);

const userPageTitle = computed(() => {
  const label = user.value?.label.trim();
  if (label) {
    return t("adminUsers.userDetails.pageTitle.withLabel", { label });
  }

  return t("adminUsers.userDetails.pageTitle.fallback");
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
const savingTags = ref(false);
const savingDescription = ref(false);
const editableTagIds = ref<string[]>([]);
const editableDescription = ref("");
const tagSaveError = ref<string | null>(null);
const syncingTagSelection = ref(false);
const queuedTagSave = ref(false);
let tagSaveTimer: ReturnType<typeof setTimeout> | null = null;

const tags = computed<TagItem[]>(() => tagsData.value);
const tagNameMap = computed<Map<string, string>>(() => {
  return new Map(tags.value.map((tag) => [tag._id, tag.name]));
});

const getTagName = (tagId: string) => {
  return tagNameMap.value.get(tagId) || t("common.labels.unknownTag");
};

watch(
  () => user.value?.tagIds,
  (tagIds) => {
    syncingTagSelection.value = true;
    editableTagIds.value = [...(tagIds || [])];
    queueMicrotask(() => {
      syncingTagSelection.value = false;
    });
  },
  { immediate: true },
);

watch(
  () => user.value?.description,
  (description) => {
    editableDescription.value = description || "";
  },
  { immediate: true },
);

const isTagSelectionDirty = computed(() => {
  const current = [...(user.value?.tagIds || [])].sort();
  const editable = [...editableTagIds.value].sort();
  return JSON.stringify(current) !== JSON.stringify(editable);
});

const isDescriptionDirty = computed(() => {
  return (user.value?.description || "") !== editableDescription.value.trim();
});

const tagSaveStatusText = computed(() => {
  if (savingTags.value) {
    return t("adminUsers.userDetails.notes.tagsSaving");
  }

  if (tagSaveError.value) {
    return t("adminUsers.userDetails.notes.tagsAutosaveFailed");
  }

  if (isTagSelectionDirty.value) {
    return t("adminUsers.userDetails.notes.tagsPendingSave");
  }

  return t("adminUsers.userDetails.notes.tagsAutoSaved");
});

const previewStatusColumns = computed(() => [
  {
    accessorKey: "source",
    header: t("adminUsers.userDetails.previewModal.table.upstream"),
  },
  {
    accessorKey: "status",
    header: t("adminUsers.userDetails.previewModal.table.status"),
  },
  {
    accessorKey: "error",
    header: t("adminUsers.userDetails.previewModal.table.error"),
  },
]);

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

const subUrl = computed(() => {
  if (!user.value) {
    return "";
  }

  const token = user.value.token;
  if (!token) {
    return "";
  }

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
});

const copyUrl = async () => {
  await navigator.clipboard.writeText(subUrl.value);
  toast.add({
    title: t("adminUsers.userDetails.toasts.copied"),
    color: "success",
  });
};

const copyNodes = async () => {
  if (!previewData.value?.nodes) {
    return;
  }

  await navigator.clipboard.writeText(previewData.value.nodes.join("\n"));
  toast.add({
    title: t("adminUsers.userDetails.toasts.copiedNodes"),
    color: "success",
  });
};

const triggerAutoSave = () => {
  if (tagSaveTimer) {
    clearTimeout(tagSaveTimer);
  }

  tagSaveTimer = setTimeout(() => {
    void saveUserTags();
  }, 450);
};

watch(
  editableTagIds,
  () => {
    if (syncingTagSelection.value || !isTagSelectionDirty.value) {
      return;
    }
    triggerAutoSave();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (tagSaveTimer) {
    clearTimeout(tagSaveTimer);
  }
});

const saveUserTags = async () => {
  if (!user.value || !userId.value) {
    return;
  }

  if (!isTagSelectionDirty.value) {
    return;
  }

  if (savingTags.value) {
    queuedTagSave.value = true;
    return;
  }

  savingTags.value = true;
  tagSaveError.value = null;
  try {
    await updateUserApi(userId.value, {
      tagIds: editableTagIds.value,
    });
    await refresh();
  } catch (error) {
    tagSaveError.value = getErrorMessage(error);
    toast.add({
      title: t("adminUsers.userDetails.toasts.tagUpdateFailed"),
      description: tagSaveError.value,
      color: "error",
    });
  } finally {
    savingTags.value = false;
    if (queuedTagSave.value) {
      queuedTagSave.value = false;
      triggerAutoSave();
    }
  }
};

const saveDescription = async () => {
  if (!user.value || !userId.value || !isDescriptionDirty.value) {
    return;
  }

  savingDescription.value = true;
  try {
    await updateUserApi(userId.value, {
      description: editableDescription.value.trim(),
    });
    await refresh();
    toast.add({
      title: t("adminUsers.userDetails.toasts.descriptionSaved"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("adminUsers.userDetails.toasts.descriptionUpdateFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    savingDescription.value = false;
  }
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
    toast.add({
      title: t("adminUsers.userDetails.toasts.tokenRotated"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
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
      title: nextState
        ? t("adminUsers.userDetails.toasts.userActivated")
        : t("adminUsers.userDetails.toasts.userDeactivated"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
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
      title: t("common.toast.errorTitle"),
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
      title: t("adminUsers.userDetails.toasts.previewFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    previewLoading.value = false;
  }
};
</script>
