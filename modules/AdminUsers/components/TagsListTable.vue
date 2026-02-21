<template>
  <UTable :data="tags" :columns="columns" :loading="loading">
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
          @click="emit('toggleDefault', row.original)"
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
          @click="emit('openEdit', row.original)"
        />
        <UButton
          size="xs"
          variant="ghost"
          color="error"
          icon="i-heroicons-trash"
          @click="emit('openDelete', row.original._id)"
        />
      </div>
    </template>
  </UTable>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TagItem } from "~/modules/AdminUsers/types/tags";

defineProps<{
  tags: TagItem[];
  columns: Array<Record<string, unknown>>;
  loading: boolean;
  updatingDefaultTagId: string | null;
}>();

const emit = defineEmits<{
  toggleDefault: [tag: TagItem];
  openEdit: [tag: TagItem];
  openDelete: [id: string];
}>();

const { t } = useI18n();
</script>
