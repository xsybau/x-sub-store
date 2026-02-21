<template>
  <div v-if="user">
    <UserDetailsHeader
      :user="user"
      :preview-loading="previewLoading"
      :toggling-status="togglingStatus"
      @preview="preview"
      @toggle-status="toggleUserStatus"
      @delete-user="deleteDialogOpen = true"
    />

    <UserDescriptionCard
      v-model:description="editableDescription"
      :is-dirty="isDescriptionDirty"
      :loading="savingDescription"
      @save="saveDescription"
    />

    <UserTagsCard
      v-model:tag-ids="editableTagIds"
      :tags="tags"
      :status-text="tagSaveStatusText"
      :get-tag-name="getTagName"
    />

    <UserSubscriptionCard
      :sub-url="subUrl"
      :token="user.token"
      @copy="copyUrl"
      @rotate="rotateDialogOpen = true"
    />

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

    <UserPreviewModal
      v-model:open="showPreview"
      :preview-loading="previewLoading"
      :preview-data="previewData"
      :preview-status-columns="previewStatusColumns"
      @copy-nodes="copyNodes"
    />

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
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import StaticNodeManager from "~/modules/AdminSources/components/StaticNodeManager.vue";
import UpstreamManager from "~/modules/AdminSources/components/UpstreamManager.vue";
import UserDescriptionCard from "~/modules/AdminUsers/components/UserDescriptionCard.vue";
import UserDetailsHeader from "~/modules/AdminUsers/components/UserDetailsHeader.vue";
import UserPreviewModal from "~/modules/AdminUsers/components/UserPreviewModal.vue";
import UserSubscriptionCard from "~/modules/AdminUsers/components/UserSubscriptionCard.vue";
import UserTagsCard from "~/modules/AdminUsers/components/UserTagsCard.vue";
import { useApiErrorMessage } from "~/modules/AdminUsers/composables/useApiErrorMessage";
import { useSubscriptionUrlBuilder } from "~/modules/AdminUsers/composables/useSubscriptionUrlBuilder";
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
const { t } = useI18n();
const { getErrorMessage } = useApiErrorMessage();
const { buildSubscriptionUrl } = useSubscriptionUrlBuilder();

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

const subUrl = computed(() => {
  const token = user.value?.token;
  if (!token) {
    return "";
  }

  return buildSubscriptionUrl(token);
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
