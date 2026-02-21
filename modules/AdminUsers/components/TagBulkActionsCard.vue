<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.tagDetails.headings.bulkUserActions") }}
      </h3>
    </template>

    <div class="flex flex-wrap gap-2">
      <UButton
        color="warning"
        :loading="runningAction === 'DEACTIVATE_USERS'"
        @click="emit('openActionDialog', 'DEACTIVATE_USERS')"
      >
        {{ t("adminUsers.tagDetails.buttons.deactivateUsers") }}
      </UButton>
      <UButton
        color="warning"
        variant="soft"
        :loading="runningAction === 'ROTATE_TOKENS'"
        @click="emit('openActionDialog', 'ROTATE_TOKENS')"
      >
        {{ t("adminUsers.tagDetails.buttons.rotateTokens") }}
      </UButton>
      <UButton
        color="error"
        :loading="runningAction === 'DELETE_USERS'"
        @click="emit('openActionDialog', 'DELETE_USERS')"
      >
        {{ t("adminUsers.tagDetails.buttons.deleteUsers") }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TagBulkAction } from "~/modules/AdminUsers/types/tags";

defineProps<{
  runningAction: TagBulkAction | null;
}>();

const emit = defineEmits<{
  openActionDialog: [action: TagBulkAction];
}>();

const { t } = useI18n();
</script>
