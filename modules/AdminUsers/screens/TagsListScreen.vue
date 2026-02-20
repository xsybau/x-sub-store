<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Tags</h2>
      <UButton @click="createDialogOpen = true">Add Tag</UButton>
    </div>

    <UTable :data="tags" :columns="columns" :loading="pending">
      <template #isDefault-cell="{ row }">
        <div class="flex items-center gap-2">
          <UBadge :color="row.original.isDefault ? 'success' : 'neutral'">
            {{ row.original.isDefault ? "Default" : "Optional" }}
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
            Manage
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
      title="Create Tag"
      description="Create a new tag for assigning users and scoped sources."
    >
      <template #content>
        <div class="p-6">
          <form class="w-full space-y-4" @submit.prevent="createTag">
            <UFormField label="Tag Name" class="w-full">
              <UInput v-model="newTag.name" class="w-full" required />
            </UFormField>
            <UCheckbox
              v-model="newTag.isDefault"
              label="Default for new users"
            />
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="createDialogOpen = false"
                >Cancel</UButton
              >
              <UButton type="submit" :loading="creating">Create</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="editDialogOpen"
      title="Edit Tag"
      description="Update tag properties and default behavior."
    >
      <template #content>
        <div class="p-6">
          <form class="w-full space-y-4" @submit.prevent="updateTag">
            <UFormField label="Tag Name" class="w-full">
              <UInput v-model="editTag.name" class="w-full" required />
            </UFormField>
            <UCheckbox
              v-model="editTag.isDefault"
              label="Default for new users"
            />
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="closeEditDialog">Cancel</UButton>
              <UButton type="submit" :loading="updating">Save</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete Tag"
      description="Deleting this tag detaches it from users and removes tag-scoped sources."
      confirm-label="Delete Tag"
      confirm-color="error"
      :loading="deleting"
      @confirm="deleteTag"
    />
  </div>
</template>

<script setup lang="ts">
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

const columns = [
  { accessorKey: "name", header: "Tag" },
  { accessorKey: "isDefault", header: "Default" },
  { accessorKey: "actions", header: "Actions" },
];

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
    return "Unexpected error";
  }

  const candidate = error as FetchError;
  const message =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as { message?: string }).message
      : undefined;

  return message || candidate.message || "Unexpected error";
};

const createTag = async () => {
  creating.value = true;
  try {
    await createTagApi(newTag.value);
    createDialogOpen.value = false;
    newTag.value = { name: "", isDefault: false };
    await refresh();
    toast.add({ title: "Tag created", color: "success" });
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
    toast.add({ title: "Tag updated", color: "success" });
  } catch (error) {
    toast.add({
      title: "Error",
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
    toast.add({ title: "Default state updated", color: "success" });
  } catch (error) {
    toast.add({
      title: "Error",
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
      title: "Tag deleted",
      description: `${String(result.detachedUsers)} users detached, ${String(result.deletedUpstreams)} upstreams removed, ${String(result.deletedStaticNodes)} static nodes removed`,
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    deleting.value = false;
  }
};
</script>
