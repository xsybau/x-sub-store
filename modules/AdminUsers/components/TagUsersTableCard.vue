<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.tagDetails.headings.usersInThisTag") }}
      </h3>
    </template>

    <UTable :data="users" :columns="columns" :loading="loading">
      <template #isActive-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'error'">
          {{
            row.original.isActive
              ? t("common.status.active")
              : t("common.status.inactive")
          }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <UButton
          :to="`/admin/users/${row.original._id}`"
          size="xs"
          variant="ghost"
          icon="i-heroicons-eye"
        />
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { UserItem } from "~/modules/AdminUsers/types/users";

defineProps<{
  users: UserItem[];
  columns: Array<Record<string, unknown>>;
  loading: boolean;
}>();

const { t } = useI18n();
</script>
