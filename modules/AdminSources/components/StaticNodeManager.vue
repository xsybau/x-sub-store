<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold">
        {{ t("adminSources.staticNodes.title") }}
      </h3>
      <UButton size="sm" @click="createDialogOpen = true">
        {{ t("adminSources.staticNodes.addButton") }}
      </UButton>
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
            :title="t('adminSources.staticNodes.actions.editStaticNode')"
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
      :title="t('adminSources.staticNodes.createModal.title')"
      :description="t('adminSources.staticNodes.createModal.description')"
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">
            {{ t("adminSources.staticNodes.createModal.heading") }}
          </h3>
          <form class="w-full space-y-4" @submit.prevent="createItem">
            <UFormField
              class="w-full"
              :label="t('adminSources.staticNodes.fields.nameLabel')"
            >
              <UInput v-model="newItem.name" class="w-full" required />
            </UFormField>
            <UFormField
              class="w-full"
              :label="t('adminSources.staticNodes.fields.contentLabel')"
            >
              <UTextarea
                v-model="newItem.content"
                class="w-full"
                required
                :rows="4"
                :placeholder="
                  t('adminSources.staticNodes.fields.contentPlaceholder')
                "
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
      :title="t('adminSources.staticNodes.editModal.title')"
      :description="t('adminSources.staticNodes.editModal.description')"
    >
      <template #content>
        <div class="p-6">
          <h3 class="mb-4 text-lg font-bold">
            {{ t("adminSources.staticNodes.editModal.heading") }}
          </h3>
          <form class="w-full space-y-4" @submit.prevent="updateItem">
            <UFormField
              class="w-full"
              :label="t('adminSources.staticNodes.fields.nameLabel')"
            >
              <UInput v-model="editItem.name" class="w-full" required />
            </UFormField>
            <UFormField
              class="w-full"
              :label="t('adminSources.staticNodes.fields.contentLabel')"
            >
              <UTextarea
                v-model="editItem.content"
                class="w-full"
                required
                :rows="4"
                :placeholder="
                  t('adminSources.staticNodes.fields.contentPlaceholder')
                "
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
      :title="t('adminSources.staticNodes.deleteDialog.title')"
      :description="t('adminSources.staticNodes.deleteDialog.description')"
      :confirm-label="t('adminSources.staticNodes.deleteDialog.confirmLabel')"
      confirm-color="error"
      :loading="deleting"
      @confirm="deleteItem"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import { useStaticNodeManager } from "~/modules/AdminSources/composables/useStaticNodeManager";
import type { SourceScope } from "~/modules/AdminSources/types/sources";

const props = defineProps<{
  scope: SourceScope;
  userId?: string;
  tagId?: string;
}>();

const { t } = useI18n();

const columns = computed(() => [
  {
    accessorKey: "name",
    header: t("adminSources.staticNodes.columns.name"),
  },
  {
    accessorKey: "content",
    header: t("adminSources.staticNodes.columns.content"),
  },
  {
    accessorKey: "actions",
    header: t("adminSources.staticNodes.columns.actions"),
  },
]);

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
