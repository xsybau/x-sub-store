<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Static Nodes</h3>
      <UButton size="sm" @click="isOpen = true">Add Static Node</UButton>
    </div>

    <UTable :data="nodes || []" :columns="columns" :loading="pending">
      <template #content-cell="{ row }">
        <UTooltip :text="row.original.content">
          <p class="max-w-[11rem] sm:max-w-[18rem] xl:max-w-[26rem] truncate rounded border border-default/70 bg-muted/20 px-2 py-1 font-mono text-xs text-toned">
            {{ row.original.content }}
          </p>
        </UTooltip>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex space-x-2">
          <UButton @click="openEditDialog(row.original)" size="xs" variant="ghost" color="primary" icon="i-heroicons-pencil-square" title="Edit Static Node" />
          <UButton @click="openDeleteDialog(row.original._id)" size="xs" variant="ghost" color="error" icon="i-heroicons-trash" />
        </div>
      </template>
    </UTable>

    <!-- Add Modal -->
    <UModal
      v-model:open="isOpen"
      title="Add Static Node"
      description="Add a manual node URI that will be included in generated subscriptions."
    >
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Add Static Node</h3>
          <form @submit.prevent="createItem" class="space-y-4 w-full">
            <UFormField class="w-full" label="Name">
              <UInput v-model="newItem.name" class="w-full" required />
            </UFormField>
            <UFormField class="w-full" label="Content (URI)">
              <UTextarea v-model="newItem.content" class="w-full" required rows="4" placeholder="vmess://..." />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton type="button" variant="ghost" @click="isOpen = false">Cancel</UButton>
              <UButton type="submit" :loading="creating">Add</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="editDialogOpen"
      title="Edit Static Node"
      description="Update label or content for this static node."
    >
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Edit Static Node</h3>
          <form @submit.prevent="updateItem" class="space-y-4 w-full">
            <UFormField class="w-full" label="Name">
              <UInput v-model="editItem.name" class="w-full" required />
            </UFormField>
            <UFormField class="w-full" label="Content (URI)">
              <UTextarea v-model="editItem.content" class="w-full" required rows="4" placeholder="vmess://..." />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton type="button" variant="ghost" @click="closeEditDialog">Cancel</UButton>
              <UButton type="submit" :loading="updating">Save Changes</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete Static Node"
      description="This static node will be permanently removed."
      confirm-label="Delete Node"
      confirm-color="error"
      :loading="deletingItem"
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  scope: 'USER' | 'GLOBAL';
  userId?: string;
}>();

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'content', header: 'Content' },
  { accessorKey: 'actions', header: 'Actions' }
];

const { data: nodes, refresh, pending } = await useFetch('/api/admin/static-nodes', {
  query: { scope: props.scope, userId: props.userId }
});

const isOpen = ref(false);
const creating = ref(false);
const newItem = ref({ name: '', content: '' });
const editDialogOpen = ref(false);
const updating = ref(false);
const editingId = ref<string | null>(null);
const editItem = ref({ name: '', content: '' });
const deleteDialogOpen = ref(false);
const deletingItem = ref(false);
const deletingId = ref<string | null>(null);
const toast = useToast();

const createItem = async () => {
  creating.value = true;
  try {
    await $fetch('/api/admin/static-nodes', {
      method: 'POST',
      body: {
        ...newItem.value,
        scope: props.scope,
        userId: props.userId
      }
    });
    isOpen.value = false;
    newItem.value = { name: '', content: '' };
    refresh();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message, color: 'error' });
  } finally {
    creating.value = false;
  }
};

const openEditDialog = (item: any) => {
  editingId.value = item._id;
  editItem.value = {
    name: item.name || '',
    content: item.content || ''
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
    await $fetch(`/api/admin/static-nodes/${editingId.value}`, {
      method: 'PUT',
      body: {
        name: editItem.value.name,
        content: editItem.value.content
      }
    });
    refresh();
    closeEditDialog();
    toast.add({ title: 'Static node updated', color: 'primary' });
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message || e.message, color: 'error' });
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
    await $fetch(`/api/admin/static-nodes/${deletingId.value}`, { method: 'DELETE' });
    refresh();
    deleteDialogOpen.value = false;
    deletingId.value = null;
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message, color: 'error' });
  } finally {
    deletingItem.value = false;
  }
};
</script>
