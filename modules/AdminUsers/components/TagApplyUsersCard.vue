<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.tagDetails.headings.applyTagToExistingUsers") }}
      </h3>
    </template>

    <div class="space-y-4">
      <UFormField :label="t('adminUsers.tagDetails.fields.selectUsersBatch')">
        <UInputMenu
          v-model="selectedUserIds"
          :items="allUserOptions"
          label-key="label"
          value-key="_id"
          :multiple="true"
          class="w-full"
          :placeholder="
            t('adminUsers.tagDetails.fields.selectUsersPlaceholder')
          "
        />
        <p class="mt-1 text-xs text-muted">
          {{
            t("adminUsers.tagDetails.fields.matchingUsersSummary", {
              total: allUsersCount,
              selected: selectedUserIds.length,
            })
          }}
        </p>
      </UFormField>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="primary"
          :loading="applyingSelectedUsers"
          :disabled="!selectedUserIds.length || applyingAllUsers"
          @click="emit('applySelectedUsers')"
        >
          {{ t("adminUsers.tagDetails.buttons.applyToSelectedUsers") }}
        </UButton>
        <UButton
          color="primary"
          variant="soft"
          :loading="applyingAllUsers"
          :disabled="applyingSelectedUsers || !allUsersCount"
          @click="emit('applyAllUsers')"
        >
          {{ t("adminUsers.tagDetails.buttons.applyToAllExistingUsers") }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

interface UserOption {
  _id: string;
  label: string;
}

const selectedUserIds = defineModel<string[]>("selectedUserIds", {
  default: () => [],
});

defineProps<{
  allUserOptions: UserOption[];
  allUsersCount: number;
  applyingSelectedUsers: boolean;
  applyingAllUsers: boolean;
}>();

const emit = defineEmits<{
  applySelectedUsers: [];
  applyAllUsers: [];
}>();

const { t } = useI18n();
</script>
