<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold">Static Nodes</h3>
      <UButton size="sm" @click="createDialogOpen = true"
        >Add Static Node</UButton
      >
    </div>

    <UTable :data="nodes || []" :columns="columns" :loading="pending">
      <template #content-cell="{ row }">
        <UTooltip :text="row.original.content">
          <p
            class="max-w-44 truncate rounded border border-default/70 bg-muted/20 px-2 py-1 font-mono text-xs text-toned sm:max-w-[18rem] xl:max-w-104"
          >
            {{ row.original.content }}
          </p>
        </UTooltip>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex space-x-2">
          <UButton
            size="xs"
            variant="ghost"
            color="primary"
            icon="i-heroicons-pencil-square"
            title="Edit Static Node"
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
      title="Add Static Node"
      description="Add a manual node URI that will be included in generated subscriptions."
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">Add Static Node</h3>
          <form class="w-full space-y-4" @submit.prevent="createItem">
            <UFormField class="w-full" label="Name">
              <UInput v-model="newItem.name" class="w-full" required />
            </UFormField>
            <UFormField class="w-full" label="Content (URI)">
              <UTextarea
                v-model="newItem.content"
                class="w-full"
                required
                :rows="4"
                placeholder="vmess://..."
              />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton
                type="button"
                variant="ghost"
                @click="createDialogOpen = false"
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
      title="Edit Static Node"
      description="Update label or content for this static node."
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">Edit Static Node</h3>
          <form class="w-full space-y-4" @submit.prevent="updateItem">
            <UFormField class="w-full" label="Name">
              <UInput v-model="editItem.name" class="w-full" required />
            </UFormField>
            <UFormField class="w-full" label="Content (URI)">
              <UTextarea
                v-model="editItem.content"
                class="w-full"
                required
                :rows="4"
                placeholder="vmess://..."
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
      title="Delete Static Node"
      description="This static node will be permanently removed."
      confirm-label="Delete Node"
      confirm-color="error"
      :loading="deleting"
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { useStaticNodeManager } from "~/modules/AdminSources/composables/useStaticNodeManager";
import type { SourceScope } from "~/modules/AdminSources/types/sources";

const props = defineProps<{
  scope: SourceScope;
  userId?: string;
  tagId?: string;
}>();

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "content", header: "Content" },
  { accessorKey: "actions", header: "Actions" },
];

const {
  nodes,
  pending,
  createDialogOpen,
  creating,
  newItem,
  createItem,
  editDialogOpen,
  updating,
  editItem,
  openEditDialog,
  closeEditDialog,
  updateItem,
  deleteDialogOpen,
  deleting,
  openDeleteDialog,
  deleteItem,
} = useStaticNodeManager({
  scope: props.scope,
  userId: props.userId,
  tagId: props.tagId,
});
</script>
