<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold">{{ t("adminSources.upstreams.title") }}</h3>
      <UButton size="sm" @click="createDialogOpen = true">
        {{ t("adminSources.upstreams.addButton") }}
      </UButton>
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
            {{ getScopeLabel(row.original.scope) }}
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
            :title="t('adminSources.upstreams.actions.copyUrl')"
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
            {{
              row.original.lastFetchStatus === 200
                ? t("common.status.healthy")
                : t("common.status.issue")
            }}
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
            :title="t('adminSources.upstreams.actions.testFetch')"
            :loading="testingUpstreamId === row.original._id"
            @click="testFetch(row.original._id, row.original.url)"
          />
          <UButton
            size="xs"
            variant="ghost"
            color="primary"
            icon="i-heroicons-pencil-square"
            :title="t('adminSources.upstreams.actions.editUpstream')"
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
      :title="t('adminSources.upstreams.createModal.title')"
      :description="t('adminSources.upstreams.createModal.description')"
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">
            {{ t("adminSources.upstreams.createModal.heading") }}
          </h3>
          <form class="w-full space-y-4" @submit.prevent="createItem">
            <UFormField
              class="w-full"
              :label="t('adminSources.upstreams.fields.nameLabel')"
            >
              <UInput v-model="newItem.name" class="w-full" required />
            </UFormField>
            <UFormField
              class="w-full"
              :label="t('adminSources.upstreams.fields.urlLabel')"
            >
              <UTextarea
                v-model="newItem.url"
                class="w-full"
                required
                :rows="3"
                autoresize
                :placeholder="t('adminSources.upstreams.fields.urlPlaceholder')"
              />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton
                type="button"
                variant="ghost"
                @click="createDialogOpen = false"
              >
                {{ t("common.actions.cancel") }}
              </UButton>
              <UButton type="submit" :loading="creating">
                {{ t("common.actions.add") }}
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="editDialogOpen"
      :title="t('adminSources.upstreams.editModal.title')"
      :description="t('adminSources.upstreams.editModal.description')"
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">
            {{ t("adminSources.upstreams.editModal.heading") }}
          </h3>
          <form class="w-full space-y-4" @submit.prevent="updateItem">
            <UFormField
              class="w-full"
              :label="t('adminSources.upstreams.fields.nameLabel')"
            >
              <UInput v-model="editItem.name" class="w-full" required />
            </UFormField>
            <UFormField
              class="w-full"
              :label="t('adminSources.upstreams.fields.urlLabel')"
            >
              <UTextarea
                v-model="editItem.url"
                class="w-full"
                required
                :rows="3"
                autoresize
                :placeholder="t('adminSources.upstreams.fields.urlPlaceholder')"
              />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton type="button" variant="ghost" @click="closeEditDialog">
                {{ t("common.actions.cancel") }}
              </UButton>
              <UButton type="submit" :loading="updating">
                {{ t("common.actions.saveChanges") }}
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :title="t('adminSources.upstreams.deleteDialog.title')"
      :description="t('adminSources.upstreams.deleteDialog.description')"
      :confirm-label="t('adminSources.upstreams.deleteDialog.confirmLabel')"
      confirm-color="error"
      :loading="deleting"
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { useUpstreamManager } from "~/modules/AdminSources/composables/useUpstreamManager";
import type { SourceScope } from "~/modules/AdminSources/types/sources";

const props = defineProps<{
  scope: SourceScope;
  userId?: string;
  tagId?: string;
}>();

const { t } = useI18n();

const columns = computed(() => [
  { accessorKey: "name", header: t("adminSources.upstreams.columns.name") },
  { accessorKey: "url", header: t("adminSources.upstreams.columns.url") },
  {
    accessorKey: "status",
    header: t("adminSources.upstreams.columns.status"),
  },
  {
    accessorKey: "checked",
    header: t("adminSources.upstreams.columns.checked"),
  },
  {
    accessorKey: "actions",
    header: t("adminSources.upstreams.columns.actions"),
  },
]);

const getScopeLabel = (scope: SourceScope): string => {
  if (scope === "USER") {
    return t("adminSources.upstreams.scope.user");
  }

  if (scope === "TAG") {
    return t("adminSources.upstreams.scope.tag");
  }

  return t("adminSources.upstreams.scope.global");
};

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
