<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.tagDetails.headings.tagSettings") }}
      </h3>
    </template>

    <div class="space-y-4">
      <UFormField :label="t('adminUsers.tagDetails.fields.tagName')">
        <UInput v-model="state.name" required />
      </UFormField>
      <UCheckbox
        v-model="state.isDefault"
        :label="t('adminUsers.tagDetails.fields.defaultForNewUsers')"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TagEditState } from "~/modules/AdminUsers/types/forms";

const state = defineModel<TagEditState>("state", {
  default: () => ({
    name: "",
    isDefault: false,
  }),
});

const { t } = useI18n();
</script>
