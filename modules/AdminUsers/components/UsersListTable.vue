<template>
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

    <template #tagIds-cell="{ row }">
      <div class="flex flex-wrap gap-1">
        <UBadge
          v-for="tagId in row.original.tagIds"
          :key="`${row.original._id}-${tagId}`"
          color="neutral"
          variant="subtle"
          size="xs"
        >
          {{ getTagName(tagId) }}
        </UBadge>
        <span v-if="!row.original.tagIds?.length" class="text-xs text-muted">
          {{ t("common.labels.noValue") }}
        </span>
      </div>
    </template>

    <template #description-cell="{ row }">
      <span v-if="!row.original.description" class="text-xs text-muted">
        {{ t("common.labels.noValue") }}
      </span>
      <UTooltip v-else :text="row.original.description">
        <p class="max-w-56 truncate text-sm text-toned">
          {{ row.original.description }}
        </p>
      </UTooltip>
    </template>

    <template #actions-cell="{ row }">
      <div class="flex space-x-2">
        <UButton
          variant="ghost"
          icon="i-heroicons-clipboard-document-list"
          :title="t('adminUsers.usersList.actions.copySubscriptionUrl')"
          :loading="copyingUrlUserId === row.original._id"
          @click="emit('copySubscriptionUrl', row.original)"
        />
        <UButton
          variant="ghost"
          icon="i-heroicons-eye"
          :title="t('adminUsers.usersList.actions.previewSubscription')"
          :loading="previewingUserId === row.original._id"
          @click="emit('previewSubscription', row.original)"
        />
        <UButton
          variant="ghost"
          :color="row.original.isActive ? 'warning' : 'success'"
          :icon="
            row.original.isActive
              ? 'i-heroicons-pause-circle'
              : 'i-heroicons-play-circle'
          "
          :loading="togglingUserId === row.original._id"
          :title="
            row.original.isActive
              ? t('adminUsers.usersList.actions.deactivateUser')
              : t('adminUsers.usersList.actions.activateUser')
          "
          @click="emit('toggleActive', row.original)"
        />
        <UButton
          :to="`/admin/users/${row.original._id}`"
          variant="ghost"
          icon="i-heroicons-pencil-square"
        />
        <UButton
          variant="ghost"
          color="error"
          icon="i-heroicons-trash"
          @click="emit('deleteUser', row.original._id)"
        />
      </div>
    </template>
  </UTable>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { UserItem } from "~/modules/AdminUsers/types/users";

const props = defineProps<{
  users: UserItem[];
  columns: Array<Record<string, unknown>>;
  loading: boolean;
  copyingUrlUserId: string | null;
  previewingUserId: string | null;
  togglingUserId: string | null;
  getTagName: (tagId: string) => string;
}>();

const emit = defineEmits<{
  copySubscriptionUrl: [user: UserItem];
  previewSubscription: [user: UserItem];
  toggleActive: [user: UserItem];
  deleteUser: [userId: string];
}>();

const { t } = useI18n();

const getTagName = (tagId: string) => {
  return props.getTagName(tagId);
};
</script>
