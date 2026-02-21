<template>
  <div
    class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-3">
      <h2 class="text-2xl font-bold">{{ tag.name }}</h2>
      <UBadge :color="tag.isDefault ? 'success' : 'neutral'" variant="subtle">
        {{
          tag.isDefault
            ? t("common.status.default")
            : t("common.status.optional")
        }}
      </UBadge>
    </div>

    <div class="flex gap-2">
      <UButton variant="soft" :loading="savingTag" @click="emit('save')">
        {{ t("adminUsers.tagDetails.saveTagButton") }}
      </UButton>
      <UButton color="error" variant="soft" @click="emit('deleteTag')">
        {{ t("adminUsers.tagDetails.deleteTagButton") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TagItem } from "~/modules/AdminUsers/types/tags";

defineProps<{
  tag: TagItem;
  savingTag: boolean;
}>();

const emit = defineEmits<{
  save: [];
  deleteTag: [];
}>();

const { t } = useI18n();
</script>
