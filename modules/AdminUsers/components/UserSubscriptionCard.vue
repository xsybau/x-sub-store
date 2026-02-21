<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.userDetails.cards.subscriptionUrl") }}
      </h3>
    </template>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <UTooltip :text="subUrl">
        <p
          class="min-w-0 flex-1 truncate rounded-md border border-accented/60 bg-muted/30 px-3 py-2 font-mono text-xs text-toned"
        >
          {{ subUrl }}
        </p>
      </UTooltip>

      <div class="flex gap-2">
        <UButton icon="i-heroicons-clipboard" @click="emit('copy')">
          {{ t("adminUsers.userDetails.buttons.copy") }}
        </UButton>
        <UButton
          color="warning"
          icon="i-heroicons-arrow-path"
          @click="emit('rotate')"
        >
          {{ t("adminUsers.userDetails.buttons.rotateToken") }}
        </UButton>
      </div>
    </div>

    <p class="mt-2 font-mono text-xs text-gray-500">
      {{
        t("adminUsers.userDetails.fields.tokenLabel", { token: token || "" })
      }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  subUrl: string;
  token: string | null;
}>();

const emit = defineEmits<{
  copy: [];
  rotate: [];
}>();

const { t } = useI18n();
</script>
