<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-bold">
        {{ t("adminUsers.userDetails.cards.userTags") }}
      </h3>
    </template>

    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tagId in tagIds"
          :key="`selected-tag-${tagId}`"
          color="neutral"
          variant="subtle"
        >
          {{ getTagName(tagId) }}
        </UBadge>
        <span v-if="!tagIds.length" class="text-sm text-muted">
          {{ t("common.labels.noValue") }}
        </span>
      </div>

      <UFormField :label="t('adminUsers.userDetails.fields.assignedTags')">
        <UInputMenu
          v-model="tagIds"
          :items="tags"
          label-key="name"
          value-key="_id"
          :multiple="true"
          :placeholder="t('adminUsers.userDetails.fields.userTagsPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end">
        <p class="text-xs text-muted">
          {{ statusText }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TagItem } from "~/modules/AdminUsers/types/tags";

const tagIds = defineModel<string[]>("tagIds", { default: () => [] });

const props = defineProps<{
  tags: TagItem[];
  statusText: string;
  getTagName: (tagId: string) => string;
}>();

const { t } = useI18n();

const getTagName = (tagId: string) => {
  return props.getTagName(tagId);
};
</script>
