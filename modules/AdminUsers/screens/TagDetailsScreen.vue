<template>
  <div v-if="tag">
    <TagDetailsHeader
      :tag="tag"
      :saving-tag="savingTag"
      @save="saveTag"
      @delete-tag="deleteDialogOpen = true"
    />

    <TagSettingsCard v-model:state="editState" />

    <TagUsersTableCard
      :users="users"
      :columns="userColumns"
      :loading="usersPending"
    />

    <TagApplyUsersCard
      v-model:selected-user-ids="selectedApplyUserIds"
      :all-user-options="allUserOptions"
      :all-users-count="allUsers.length"
      :applying-selected-users="applyingSelectedUsers"
      :applying-all-users="applyingAllUsers"
      @apply-selected-users="applyToSelectedUsers"
      @apply-all-users="applyToAllUsers"
    />

    <TagBulkActionsCard
      :running-action="runningAction"
      @open-action-dialog="openActionDialog"
    />

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ t("adminUsers.tagDetails.headings.tagUpstreams") }}
          </h3>
        </template>
        <UpstreamManager scope="TAG" :tag-id="tag._id" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ t("adminUsers.tagDetails.headings.tagStaticNodes") }}
          </h3>
        </template>
        <StaticNodeManager scope="TAG" :tag-id="tag._id" />
      </UCard>
    </div>

    <ConfirmDialog
      v-model:open="actionDialogOpen"
      :title="actionDialogTitle"
      :description="actionDialogDescription"
      :confirm-label="actionDialogConfirmLabel"
      :confirm-color="actionDialogColor"
      :loading="runningAction !== null"
      @confirm="runAction"
    />

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :title="t('adminUsers.tagDetails.deleteDialog.title')"
      :description="t('adminUsers.tagDetails.deleteDialog.description')"
      :confirm-label="t('adminUsers.tagDetails.deleteDialog.confirmLabel')"
      confirm-color="error"
      :loading="deletingTag"
      @confirm="deleteTag"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import StaticNodeManager from "~/modules/AdminSources/components/StaticNodeManager.vue";
import UpstreamManager from "~/modules/AdminSources/components/UpstreamManager.vue";
import TagApplyUsersCard from "~/modules/AdminUsers/components/TagApplyUsersCard.vue";
import TagBulkActionsCard from "~/modules/AdminUsers/components/TagBulkActionsCard.vue";
import TagDetailsHeader from "~/modules/AdminUsers/components/TagDetailsHeader.vue";
import TagSettingsCard from "~/modules/AdminUsers/components/TagSettingsCard.vue";
import TagUsersTableCard from "~/modules/AdminUsers/components/TagUsersTableCard.vue";
import { useApiErrorMessage } from "~/modules/AdminUsers/composables/useApiErrorMessage";
import type { TagEditState } from "~/modules/AdminUsers/types/forms";
import type {
  TagBulkAction,
  TagItem,
  UpdateTagInput,
} from "~/modules/AdminUsers/types/tags";
import type { UserItem } from "~/modules/AdminUsers/types/users";
import {
  applyTagToUsersApi,
  deleteTagApi,
  getTagApi,
  runTagActionApi,
  updateTagApi,
} from "~/modules/AdminUsers/utils/tagsApi";
import { listUsersApi } from "~/modules/AdminUsers/utils/usersApi";

const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const { getErrorMessage } = useApiErrorMessage();

const requestHeaders = import.meta.server
  ? useRequestHeaders(["cookie"])
  : undefined;

const tagId = computed(() => {
  const value = route.params.id;
  return typeof value === "string" ? value : "";
});

const { data: tag, refresh: refreshTag } = useAsyncData<TagItem | null>(
  () => `admin-tag-${tagId.value}`,
  async () => {
    if (!tagId.value) {
      throw createError({
        statusCode: 400,
        statusMessage: t("adminUsers.errors.invalidTagId"),
      });
    }

    return getTagApi(tagId.value);
  },
  {
    watch: [tagId],
    default: () => null,
  },
);

const {
  data: usersData,
  status: usersStatus,
  refresh: refreshUsers,
} = useAsyncData<UserItem[]>(
  () => `admin-tag-users-${tagId.value}`,
  async () => {
    if (!tagId.value) {
      return [];
    }

    return listUsersApi({
      headers: requestHeaders,
      tagId: tagId.value,
    });
  },
  {
    watch: [tagId],
    default: (): UserItem[] => [],
  },
);

const {
  data: allUsersData,
  status: allUsersStatus,
  refresh: refreshAllUsers,
} = useAsyncData<UserItem[]>(
  "admin-all-users-for-tag-apply",
  async () => {
    return listUsersApi({ headers: requestHeaders });
  },
  {
    default: (): UserItem[] => [],
  },
);

const editState = ref<TagEditState>({
  name: "",
  isDefault: false,
});

watch(
  () => tag.value,
  (nextTag) => {
    if (!nextTag) {
      return;
    }

    editState.value = {
      name: nextTag.name,
      isDefault: nextTag.isDefault,
    };
  },
  { immediate: true },
);

const users = computed(() => usersData.value);
const allUsers = computed(() => allUsersData.value);
const usersPending = computed(() => {
  return usersStatus.value === "pending" || allUsersStatus.value === "pending";
});

const allUserOptions = computed(() => {
  return allUsers.value.map((user) => ({
    _id: user._id,
    label: user.email ? `${user.label} (${user.email})` : user.label,
  }));
});

const savePayload = computed<UpdateTagInput>(() => {
  return {
    name: editState.value.name,
    isDefault: editState.value.isDefault,
  };
});

const savingTag = ref(false);
const deletingTag = ref(false);
const applyingSelectedUsers = ref(false);
const applyingAllUsers = ref(false);
const selectedApplyUserIds = ref<string[]>([]);

const actionDialogOpen = ref(false);
const pendingAction = ref<TagBulkAction | null>(null);
const runningAction = ref<TagBulkAction | null>(null);

const deleteDialogOpen = ref(false);

const userColumns = computed(() => [
  { accessorKey: "label", header: t("adminUsers.tagDetails.userTable.user") },
  { accessorKey: "email", header: t("adminUsers.tagDetails.userTable.email") },
  {
    accessorKey: "isActive",
    header: t("adminUsers.tagDetails.userTable.status"),
  },
  {
    accessorKey: "actions",
    header: t("adminUsers.tagDetails.userTable.actions"),
  },
]);

useHead(() => ({
  title: tag.value
    ? t("adminUsers.tagDetails.pageTitle.withName", { name: tag.value.name })
    : t("adminUsers.tagDetails.pageTitle.fallback"),
}));

const saveTag = async () => {
  if (!tag.value) {
    return;
  }

  savingTag.value = true;
  try {
    await updateTagApi(tag.value._id, savePayload.value);
    await refreshTag();
    toast.add({
      title: t("adminUsers.tagDetails.toasts.tagUpdated"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    savingTag.value = false;
  }
};

const openActionDialog = (action: TagBulkAction) => {
  pendingAction.value = action;
  actionDialogOpen.value = true;
};

const actionDialogTitle = computed(() => {
  if (pendingAction.value === "DELETE_USERS") {
    return t("adminUsers.tagDetails.actionDialog.deleteUsers.title");
  }
  if (pendingAction.value === "DEACTIVATE_USERS") {
    return t("adminUsers.tagDetails.actionDialog.deactivateUsers.title");
  }
  return t("adminUsers.tagDetails.actionDialog.rotateTokens.title");
});

const actionDialogDescription = computed(() => {
  if (pendingAction.value === "DELETE_USERS") {
    return t("adminUsers.tagDetails.actionDialog.deleteUsers.description");
  }
  if (pendingAction.value === "DEACTIVATE_USERS") {
    return t("adminUsers.tagDetails.actionDialog.deactivateUsers.description");
  }
  return t("adminUsers.tagDetails.actionDialog.rotateTokens.description");
});

const actionDialogConfirmLabel = computed(() => {
  if (pendingAction.value === "DELETE_USERS") {
    return t("adminUsers.tagDetails.actionDialog.deleteUsers.confirmLabel");
  }
  if (pendingAction.value === "DEACTIVATE_USERS") {
    return t("adminUsers.tagDetails.actionDialog.deactivateUsers.confirmLabel");
  }
  return t("adminUsers.tagDetails.actionDialog.rotateTokens.confirmLabel");
});

const actionDialogColor = computed<"warning" | "error">(() => {
  return pendingAction.value === "DELETE_USERS" ? "error" : "warning";
});

const runAction = async () => {
  if (!tag.value || !pendingAction.value) {
    return;
  }

  runningAction.value = pendingAction.value;

  try {
    const result = await runTagActionApi(tag.value._id, pendingAction.value);
    actionDialogOpen.value = false;
    pendingAction.value = null;
    await refreshUsers();
    toast.add({
      title: t("adminUsers.tagDetails.toasts.actionCompleted"),
      description: t("adminUsers.tagDetails.toasts.actionCompletedDetails", {
        matchedUsers: String(result.matchedUsers),
        affectedUsers: String(result.affectedUsers),
      }),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("adminUsers.tagDetails.toasts.actionFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    runningAction.value = null;
  }
};

const deleteTag = async () => {
  if (!tag.value) {
    return;
  }

  deletingTag.value = true;
  try {
    const result = await deleteTagApi(tag.value._id);
    deleteDialogOpen.value = false;
    toast.add({
      title: t("adminUsers.tagDetails.toasts.tagDeleted"),
      description: t("adminUsers.tagsList.toasts.tagDeletedDetails", {
        detachedUsers: String(result.detachedUsers),
        deletedUpstreams: String(result.deletedUpstreams),
        deletedStaticNodes: String(result.deletedStaticNodes),
      }),
      color: "success",
    });
    await navigateTo("/admin/tags");
  } catch (error) {
    toast.add({
      title: t("adminUsers.tagDetails.toasts.deleteFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    deletingTag.value = false;
  }
};

const applyToSelectedUsers = async () => {
  if (!tag.value || !selectedApplyUserIds.value.length) {
    return;
  }

  applyingSelectedUsers.value = true;
  try {
    const result = await applyTagToUsersApi(tag.value._id, {
      mode: "SELECTED",
      userIds: selectedApplyUserIds.value,
    });
    selectedApplyUserIds.value = [];
    await Promise.all([refreshUsers(), refreshAllUsers()]);
    toast.add({
      title: t("adminUsers.tagDetails.toasts.tagAppliedToSelectedUsers"),
      description: t("adminUsers.tagDetails.toasts.applyDetails", {
        matchedUsers: String(result.matchedUsers),
        affectedUsers: String(result.affectedUsers),
      }),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("adminUsers.tagDetails.toasts.applyFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    applyingSelectedUsers.value = false;
  }
};

const applyToAllUsers = async () => {
  if (!tag.value) {
    return;
  }

  applyingAllUsers.value = true;
  try {
    const result = await applyTagToUsersApi(tag.value._id, {
      mode: "ALL",
    });
    await Promise.all([refreshUsers(), refreshAllUsers()]);
    toast.add({
      title: t("adminUsers.tagDetails.toasts.tagAppliedToAllUsers"),
      description: t("adminUsers.tagDetails.toasts.applyDetails", {
        matchedUsers: String(result.matchedUsers),
        affectedUsers: String(result.affectedUsers),
      }),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("adminUsers.tagDetails.toasts.applyFailed"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    applyingAllUsers.value = false;
  }
};
</script>
