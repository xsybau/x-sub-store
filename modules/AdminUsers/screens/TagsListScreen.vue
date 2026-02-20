<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">{{ t("adminUsers.tagsList.title") }}</h2>
      <UButton @click="createDialogOpen = true">
        {{ t("adminUsers.tagsList.addTagButton") }}
      </UButton>
    </div>

    <UTable :data="tags" :columns="columns" :loading="pending">
      <template #isDefault-cell="{ row }">
        <div class="flex items-center gap-2">
          <UBadge :color="row.original.isDefault ? 'success' : 'neutral'">
            {{
              row.original.isDefault
                ? t("common.status.default")
                : t("common.status.optional")
            }}
          </UBadge>
          <UButton
            size="xs"
            variant="ghost"
            :icon="
              row.original.isDefault
                ? 'i-heroicons-star-solid'
                : 'i-heroicons-star'
            "
            :loading="updatingDefaultTagId === row.original._id"
            @click="toggleDefault(row.original)"
          />
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton
            :to="`/admin/tags/${row.original._id}`"
            size="xs"
            variant="soft"
          >
            {{ t("adminUsers.tagsList.manageButton") }}
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-heroicons-pencil-square"
            @click="openEditDialog(row.original)"
          />
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-heroicons-trash"
            @click="openDeleteDialog(row.original._id)"
          />
        </div>
      </template>
    </UTable>

    <UModal
      v-model:open="createDialogOpen"
      :title="t('adminUsers.tagsList.createModal.title')"
      :description="t('adminUsers.tagsList.createModal.description')"
    >
      <template #content>
        <div class="p-6">
          <form class="w-full space-y-4" @submit.prevent="createTag">
            <UFormField
              :label="t('adminUsers.tagsList.createModal.tagNameLabel')"
              class="w-full"
            >
              <UInput v-model="newTag.name" class="w-full" required />
            </UFormField>
            <UCheckbox
              v-model="newTag.isDefault"
              :label="t('adminUsers.tagsList.createModal.defaultCheckbox')"
            />
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="createDialogOpen = false">
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
      v-model:open="editDialogOpen"
      :title="t('adminUsers.tagsList.editModal.title')"
      :description="t('adminUsers.tagsList.editModal.description')"
    >
      <template #content>
        <div class="p-6">
          <form class="w-full space-y-4" @submit.prevent="updateTag">
            <UFormField
              :label="t('adminUsers.tagsList.editModal.tagNameLabel')"
              class="w-full"
            >
              <UInput v-model="editTag.name" class="w-full" required />
            </UFormField>
            <UCheckbox
              v-model="editTag.isDefault"
              :label="t('adminUsers.tagsList.editModal.defaultCheckbox')"
            />
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="closeEditDialog">
                {{ t("common.actions.cancel") }}
              </UButton>
              <UButton type="submit" :loading="updating">
                {{ t("common.actions.save") }}
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

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
import type { FetchError } from "ofetch";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import type { TagItem } from "~/modules/AdminUsers/types/tags";
import {
  createTagApi,
  deleteTagApi,
  listTagsApi,
  updateTagApi,
} from "~/modules/AdminUsers/utils/tagsApi";

interface TagFormState {
  name: string;
  isDefault: boolean;
}

const { t } = useI18n();

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
const newTag = ref<TagFormState>({ name: "", isDefault: false });

const editDialogOpen = ref(false);
const updating = ref(false);
const editingTagId = ref<string | null>(null);
const editTag = ref<TagFormState>({ name: "", isDefault: false });

const updatingDefaultTagId = ref<string | null>(null);

const deleteDialogOpen = ref(false);
const deleting = ref(false);
const deletingTagId = ref<string | null>(null);

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

const createTag = async () => {
  creating.value = true;
  try {
    await createTagApi(newTag.value);
    createDialogOpen.value = false;
    newTag.value = { name: "", isDefault: false };
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
  editingTagId.value = tag._id;
  editTag.value = {
    name: tag.name,
    isDefault: tag.isDefault,
  };
  editDialogOpen.value = true;
};

const closeEditDialog = () => {
  editingTagId.value = null;
  editTag.value = { name: "", isDefault: false };
  editDialogOpen.value = false;
};

const updateTag = async () => {
  if (!editingTagId.value) {
    return;
  }

  updating.value = true;
  try {
    await updateTagApi(editingTagId.value, editTag.value);
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
