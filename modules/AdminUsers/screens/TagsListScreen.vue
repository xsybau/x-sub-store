<template>
  <div>
    <ListScreenHeader
      :title="t('adminUsers.tagsList.title')"
      :action-label="t('adminUsers.tagsList.addTagButton')"
      @action="createDialogOpen = true"
    />

    <TagsListTable
      :tags="tags"
      :columns="columns"
      :loading="pending"
      :updating-default-tag-id="updatingDefaultTagId"
      @toggle-default="toggleDefault"
      @open-edit="openEditDialog"
      @open-delete="openDeleteDialog"
    />

    <TagCreateModal
      v-model:open="createDialogOpen"
      :loading="creating"
      @submit="createTag"
    />

    <TagEditModal
      v-model:open="editDialogOpen"
      :loading="updating"
      :initial-name="editingTag?.name || ''"
      :initial-is-default="editingTag?.isDefault || false"
      @submit="updateTag"
    />

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :title="t('adminUsers.tagsList.deleteDialog.title')"
      :description="t('adminUsers.tagsList.deleteDialog.description')"
      :confirm-label="t('adminUsers.tagsList.deleteDialog.confirmLabel')"
      confirm-color="error"
      :loading="deleting"
      @confirm="deleteTag"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import ListScreenHeader from "~/modules/AdminUsers/components/ListScreenHeader.vue";
import TagCreateModal from "~/modules/AdminUsers/components/TagCreateModal.vue";
import TagEditModal from "~/modules/AdminUsers/components/TagEditModal.vue";
import TagsListTable from "~/modules/AdminUsers/components/TagsListTable.vue";
import { useApiErrorMessage } from "~/modules/AdminUsers/composables/useApiErrorMessage";
import type { TagModalPayload } from "~/modules/AdminUsers/types/forms";
import type { TagItem } from "~/modules/AdminUsers/types/tags";
import {
  createTagApi,
  deleteTagApi,
  listTagsApi,
  updateTagApi,
} from "~/modules/AdminUsers/utils/tagsApi";

const { t } = useI18n();
const { getErrorMessage } = useApiErrorMessage();

const columns = computed(() => [
  { accessorKey: "name", header: t("adminUsers.tagsList.columns.tag") },
  {
    accessorKey: "isDefault",
    header: t("adminUsers.tagsList.columns.default"),
  },
  {
    accessorKey: "actions",
    header: t("adminUsers.tagsList.columns.actions"),
  },
]);

const requestHeaders = import.meta.server
  ? useRequestHeaders(["cookie"])
  : undefined;

const { data, status, refresh } = useAsyncData<TagItem[]>(
  "admin-tags-list",
  () => listTagsApi(requestHeaders),
  {
    default: (): TagItem[] => [],
  },
);

const tags = computed(() => data.value);
const pending = computed(() => status.value === "pending");
const toast = useToast();

const createDialogOpen = ref(false);
const creating = ref(false);

const editDialogOpen = ref(false);
const updating = ref(false);
const editingTag = ref<TagItem | null>(null);

const updatingDefaultTagId = ref<string | null>(null);

const deleteDialogOpen = ref(false);
const deleting = ref(false);
const deletingTagId = ref<string | null>(null);

const createTag = async (payload: TagModalPayload) => {
  creating.value = true;
  try {
    await createTagApi(payload);
    createDialogOpen.value = false;
    await refresh();
    toast.add({
      title: t("adminUsers.tagsList.toasts.tagCreated"),
      color: "success",
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

const openEditDialog = (tag: TagItem) => {
  editingTag.value = tag;
  editDialogOpen.value = true;
};

const closeEditDialog = () => {
  editingTag.value = null;
  editDialogOpen.value = false;
};

const updateTag = async (payload: TagModalPayload) => {
  if (!editingTag.value?._id) {
    return;
  }

  updating.value = true;
  try {
    await updateTagApi(editingTag.value._id, payload);
    await refresh();
    closeEditDialog();
    toast.add({
      title: t("adminUsers.tagsList.toasts.tagUpdated"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    updating.value = false;
  }
};

const toggleDefault = async (tag: TagItem) => {
  updatingDefaultTagId.value = tag._id;
  try {
    await updateTagApi(tag._id, {
      isDefault: !tag.isDefault,
    });
    await refresh();
    toast.add({
      title: t("adminUsers.tagsList.toasts.defaultStateUpdated"),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    updatingDefaultTagId.value = null;
  }
};

const openDeleteDialog = (id: string) => {
  deletingTagId.value = id;
  deleteDialogOpen.value = true;
};

const deleteTag = async () => {
  if (!deletingTagId.value) {
    return;
  }

  deleting.value = true;
  try {
    const result = await deleteTagApi(deletingTagId.value);
    await refresh();
    deleteDialogOpen.value = false;
    deletingTagId.value = null;
    toast.add({
      title: t("adminUsers.tagsList.toasts.tagDeleted"),
      description: t("adminUsers.tagsList.toasts.tagDeletedDetails", {
        detachedUsers: String(result.detachedUsers),
        deletedUpstreams: String(result.deletedUpstreams),
        deletedStaticNodes: String(result.deletedStaticNodes),
      }),
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    deleting.value = false;
  }
};
</script>
