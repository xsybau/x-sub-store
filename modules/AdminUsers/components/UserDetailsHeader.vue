<template>
  <div class="mb-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <h2 class="text-2xl font-bold">{{ user.label }}</h2>
      <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle">
        {{
          user.isActive
            ? t("common.status.active")
            : t("common.status.inactive")
        }}
      </UBadge>
    </div>

    <div class="flex space-x-2">
      <UButton
        variant="soft"
        :loading="previewLoading"
        @click="emit('preview')"
      >
        {{ t("adminUsers.userDetails.previewSubscriptionButton") }}
      </UButton>
      <UButton
        variant="soft"
        :color="user.isActive ? 'warning' : 'success'"
        :loading="togglingStatus"
        :icon="
          user.isActive ? 'i-heroicons-pause-circle' : 'i-heroicons-play-circle'
        "
        @click="emit('toggleStatus')"
      >
        {{
          user.isActive
            ? t("adminUsers.userDetails.deactivateButton")
            : t("adminUsers.userDetails.activateButton")
        }}
      </UButton>
      <UButton color="error" @click="emit('deleteUser')">
        {{ t("adminUsers.userDetails.deleteUserButton") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { UserWithToken } from "~/modules/AdminUsers/types/users";

defineProps<{
  user: UserWithToken;
  previewLoading: boolean;
  togglingStatus: boolean;
}>();

const emit = defineEmits<{
  preview: [];
  toggleStatus: [];
  deleteUser: [];
}>();

const { t } = useI18n();
</script>
