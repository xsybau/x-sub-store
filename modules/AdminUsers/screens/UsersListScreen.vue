<template>
  <div>
    <ListScreenHeader
      :title="t('adminUsers.usersList.title')"
      :action-label="t('adminUsers.usersList.addUserButton')"
      @action="isCreateDialogOpen = true"
    />

    <UsersListTable
      :users="users"
      :columns="columns"
      :loading="pending"
      :copying-url-user-id="copyingUrlUserId"
      :previewing-user-id="previewingUserId"
      :toggling-user-id="togglingUserId"
      :get-tag-name="getTagName"
      @copy-subscription-url="copySubscriptionUrl"
      @preview-subscription="previewFromList"
      @toggle-active="toggleUserActive"
      @delete-user="openDeleteDialog"
    />

    <UsersCreateModal
      ref="createModalRef"
      v-model:open="isCreateDialogOpen"
      :tags="tags"
      :loading="creating"
      @submit="createUser"
    />

    <UsersPreviewModal
      v-model:open="previewModalOpen"
      :preview-data="previewData"
      :previewing-user-id="previewingUserId"
      :preview-target-label="previewTargetLabel"
      :preview-target-id="previewTargetId"
    />

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
import ConfirmDialog from "~/app/components/ConfirmDialog.vue";
import ListScreenHeader from "~/modules/AdminUsers/components/ListScreenHeader.vue";
import UsersCreateModal from "~/modules/AdminUsers/components/UsersCreateModal.vue";
import UsersListTable from "~/modules/AdminUsers/components/UsersListTable.vue";
import UsersPreviewModal from "~/modules/AdminUsers/components/UsersPreviewModal.vue";
import { useApiErrorMessage } from "~/modules/AdminUsers/composables/useApiErrorMessage";
import { useSubscriptionUrlBuilder } from "~/modules/AdminUsers/composables/useSubscriptionUrlBuilder";
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

interface UsersCreateModalExposed {
  resetForm: () => void;
}

const { t } = useI18n();
const { getErrorMessage } = useApiErrorMessage();
const { buildSubscriptionUrl } = useSubscriptionUrlBuilder();

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

const createModalRef = ref<UsersCreateModalExposed | null>(null);
const isCreateDialogOpen = ref(false);
const creating = ref(false);

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

const createUser = async (payload: CreateUserInput) => {
  creating.value = true;
  try {
    await createUserApi(payload);
    isCreateDialogOpen.value = false;
    createModalRef.value?.resetForm();
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
