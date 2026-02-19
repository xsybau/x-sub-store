<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Upstreams</h3>
      <UButton size="sm" @click="isOpen = true">Add Upstream</UButton>
    </div>

    <UTable
      class="table-fixed"
      :data="upstreams || []"
      :columns="columns"
      :loading="pending"
    >
      <template #name-cell="{ row }">
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ row.original.name }}</p>
          <p class="text-xs text-muted truncate">
            {{ row.original.scope === "USER" ? "User scope" : "Global scope" }}
          </p>
        </div>
      </template>
      <template #url-cell="{ row }">
        <div class="flex items-center gap-2 min-w-0">
          <UTooltip :text="row.original.url">
            <p
              class="max-w-[13rem] truncate rounded border border-default/70 bg-muted/20 px-2 py-1 font-mono text-xs text-toned"
            >
              {{ row.original.url }}
            </p>
          </UTooltip>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-clipboard"
            title="Copy URL"
            @click="copyUrl(row.original.url)"
          />
        </div>
      </template>
      <template #status-cell="{ row }">
        <div class="space-y-1">
          <UBadge
            :color="row.original.lastFetchStatus === 200 ? 'success' : 'error'"
            variant="subtle"
          >
            {{ row.original.lastFetchStatus === 200 ? "Healthy" : "Issue" }}
          </UBadge>
          <UTooltip
            v-if="row.original.lastError"
            :text="row.original.lastError"
          >
            <p
              class="max-w-[16rem] truncate text-xs text-error"
              @click="copyError(row.original.lastError)"
            >
              {{ row.original.lastError }}
            </p>
          </UTooltip>
        </div>
      </template>
      <template #checked-cell="{ row }">
        <p class="text-xs text-muted">
          {{ formatDate(row.original.lastFetchAt) }}
        </p>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex space-x-2">
          <UButton
            @click="testFetch(row.original.url)"
            size="xs"
            variant="ghost"
            icon="i-heroicons-bolt"
            title="Test Fetch"
          />
          <UButton
            @click="openEditDialog(row.original)"
            size="xs"
            variant="ghost"
            color="primary"
            icon="i-heroicons-pencil-square"
            title="Edit Upstream"
          />
          <UButton
            @click="openDeleteDialog(row.original._id)"
            size="xs"
            variant="ghost"
            color="error"
            icon="i-heroicons-trash"
          />
        </div>
      </template>
    </UTable>

    <!-- Add Modal -->
    <UModal
      v-model:open="isOpen"
      title="Add Upstream"
      description="Create a new upstream source for subscriptions."
    >
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Add Upstream</h3>
          <form @submit.prevent="createItem" class="space-y-4 w-full">
            <UFormField class="w-full" label="Name">
              <UInput v-model="newItem.name" class="w-full" required />
            </UFormField>
            <UFormField class="w-full" label="URL">
              <UTextarea
                v-model="newItem.url"
                class="w-full"
                required
                :rows="3"
                autoresize
                placeholder="https://example.com/sub/..."
              />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton type="button" variant="ghost" @click="isOpen = false"
                >Cancel</UButton
              >
              <UButton type="submit" :loading="creating">Add</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="editDialogOpen"
      title="Edit Upstream"
      description="Update upstream details for this source."
    >
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Edit Upstream</h3>
          <form @submit.prevent="updateItem" class="space-y-4 w-full">
            <UFormField class="w-full" label="Name">
              <UInput v-model="editItem.name" class="w-full" required />
            </UFormField>
            <UFormField class="w-full" label="URL">
              <UTextarea
                v-model="editItem.url"
                class="w-full"
                required
                :rows="3"
                autoresize
                placeholder="https://example.com/sub/..."
              />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton type="button" variant="ghost" @click="closeEditDialog"
                >Cancel</UButton
              >
              <UButton type="submit" :loading="updating">Save Changes</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete Upstream"
      description="This upstream will be removed from subscriptions."
      confirm-label="Delete Upstream"
      confirm-color="error"
      :loading="deletingItem"
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  scope: "USER" | "GLOBAL";
  userId?: string;
}>();

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "url", header: "URL" },
  { accessorKey: "status", header: "Last Status" },
  { accessorKey: "checked", header: "Last Check" },
  { accessorKey: "actions", header: "Actions" },
];

const {
  data: upstreams,
  refresh,
  pending,
} = await useFetch("/api/admin/upstreams", {
  query: { scope: props.scope, userId: props.userId },
});

const isOpen = ref(false);
const creating = ref(false);
const newItem = ref({ name: "", url: "" });
const editDialogOpen = ref(false);
const updating = ref(false);
const editingId = ref<string | null>(null);
const editItem = ref({ name: "", url: "" });
const deleteDialogOpen = ref(false);
const deletingItem = ref(false);
const deletingId = ref<string | null>(null);
const toast = useToast();

const copyUrl = async (url: string) => {
  await navigator.clipboard.writeText(url);
  toast.add({ title: "URL copied", color: "primary" });
};

const copyError = async (error: string) => {
  await navigator.clipboard.writeText(error);
  toast.add({ title: "Error copied", color: "primary" });
};

const formatDate = (value?: string | Date) => {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Unknown";
  }
};

const createItem = async () => {
  creating.value = true;
  try {
    await $fetch("/api/admin/upstreams", {
      method: "POST",
      body: {
        ...newItem.value,
        scope: props.scope,
        userId: props.userId,
      },
    });
    isOpen.value = false;
    newItem.value = { name: "", url: "" };
    refresh();
  } catch (e: any) {
    toast.add({ title: "Error", description: e.data?.message, color: "error" });
  } finally {
    creating.value = false;
  }
};

const openEditDialog = (item: any) => {
  editingId.value = item._id;
  editItem.value = {
    name: item.name || "",
    url: item.url || "",
  };
  editDialogOpen.value = true;
};

const closeEditDialog = () => {
  editDialogOpen.value = false;
  editingId.value = null;
};

const updateItem = async () => {
  if (!editingId.value) return;
  updating.value = true;
  try {
    await $fetch(`/api/admin/upstreams/${editingId.value}`, {
      method: "PUT",
      body: {
        name: editItem.value.name,
        url: editItem.value.url,
      },
    });
    refresh();
    closeEditDialog();
    toast.add({ title: "Upstream updated", color: "primary" });
  } catch (e: any) {
    toast.add({
      title: "Error",
      description: e.data?.message || e.message,
      color: "error",
    });
  } finally {
    updating.value = false;
  }
};

const openDeleteDialog = (id: string) => {
  deletingId.value = id;
  deleteDialogOpen.value = true;
};

const deleteItem = async () => {
  if (!deletingId.value) return;
  deletingItem.value = true;
  try {
    await $fetch(`/api/admin/upstreams/${deletingId.value}`, {
      method: "DELETE",
    });
    refresh();
    deleteDialogOpen.value = false;
    deletingId.value = null;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.data?.message, color: "error" });
  } finally {
    deletingItem.value = false;
  }
};

const testFetch = async (url: string) => {
  try {
    const res: any = await $fetch("/api/admin/test-fetch", {
      method: "POST",
      body: { url },
    });
    if (res.success) {
      toast.add({
        title: "Success",
        description: `Fetched ${res.size} bytes in ${res.duration}ms`,
        color: "success",
      });
    } else {
      toast.add({ title: "Failed", description: res.error, color: "error" });
    }
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message, color: "error" });
  }
};
</script>
