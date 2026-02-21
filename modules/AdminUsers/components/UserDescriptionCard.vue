<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.userDetails.cards.adminNotes") }}
      </h3>
    </template>

    <div class="space-y-3">
      <UFormField
        :label="t('adminUsers.userDetails.fields.descriptionAdminOnly')"
      >
        <UTextarea
          v-model="description"
          class="w-full"
          :rows="4"
          :maxlength="500"
          :placeholder="
            t('adminUsers.userDetails.fields.descriptionPlaceholder')
          "
        />
      </UFormField>

      <div class="flex items-center justify-between">
        <p class="text-xs text-muted">
          {{ t("adminUsers.userDetails.notes.adminOnlyVisibility") }}
        </p>
        <UButton
          size="sm"
          :loading="loading"
          :disabled="!isDirty"
          @click="emit('save')"
        >
          {{ t("adminUsers.userDetails.buttons.saveDescription") }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const description = defineModel<string>("description", { default: "" });

defineProps<{
  isDirty: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  save: [];
}>();

const { t } = useI18n();
</script>
