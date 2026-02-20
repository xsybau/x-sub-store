<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold">Upstreams</h3>
      <UButton size="sm" @click="createDialogOpen = true">Add Upstream</UButton>
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
          <p class="truncate text-xs text-muted">
            {{
              row.original.scope === "USER"
                ? "User scope"
                : row.original.scope === "TAG"
                  ? "Tag scope"
                  : "Global scope"
            }}
          </p>
        </div>
      </template>

      <template #url-cell="{ row }">
        <div class="flex min-w-0 items-center gap-2">
          <UTooltip :text="row.original.url">
            <p
              class="max-w-52 truncate rounded border border-default/70 bg-muted/20 px-2 py-1 font-mono text-xs text-toned"
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
            size="xs"
            variant="ghost"
            icon="i-heroicons-bolt"
            title="Test Fetch"
            :loading="testingUpstreamId === row.original._id"
            @click="testFetch(row.original._id, row.original.url)"
          />
          <UButton
            size="xs"
            variant="ghost"
            color="primary"
            icon="i-heroicons-pencil-square"
            title="Edit Upstream"
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
      title="Add Upstream"
      description="Create a new upstream source for subscriptions."
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">Add Upstream</h3>
          <form class="w-full space-y-4" @submit.prevent="createItem">
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
      title="Edit Upstream"
      description="Update upstream details for this source."
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">Edit Upstream</h3>
          <form class="w-full space-y-4" @submit.prevent="updateItem">
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
      :loading="deleting"
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { useUpstreamManager } from "~/modules/AdminSources/composables/useUpstreamManager";
import type { SourceScope } from "~/modules/AdminSources/types/sources";

const props = defineProps<{
  scope: SourceScope;
  userId?: string;
  tagId?: string;
}>();

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "url", header: "URL" },
  { accessorKey: "status", header: "Last Status" },
  { accessorKey: "checked", header: "Last Check" },
  { accessorKey: "actions", header: "Actions" },
];

const {
  upstreams,
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
  testFetch,
  testingUpstreamId,
  copyUrl,
  copyError,
  formatDate,
} = useUpstreamManager({
  scope: props.scope,
  userId: props.userId,
  tagId: props.tagId,
});
</script>
