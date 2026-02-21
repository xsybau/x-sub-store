<template>
  <UModal
    v-model:open="open"
    :title="t('adminUsers.tagsList.editModal.title')"
    :description="t('adminUsers.tagsList.editModal.description')"
  >
    <template #content>
      <div class="p-6">
        <form class="w-full space-y-4" @submit.prevent="submit">
          <UFormField
            :label="t('adminUsers.tagsList.editModal.tagNameLabel')"
            class="w-full"
          >
            <UInput v-model="name" class="w-full" required />
          </UFormField>
          <UCheckbox
            v-model="isDefault"
            :label="t('adminUsers.tagsList.editModal.defaultCheckbox')"
          />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="open = false">
              {{ t("common.actions.cancel") }}
            </UButton>
            <UButton type="submit" :loading="loading">
              {{ t("common.actions.save") }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { TagModalPayload } from "~/modules/AdminUsers/types/forms";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  loading: boolean;
  initialName: string;
  initialIsDefault: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: TagModalPayload];
}>();

const { t } = useI18n();

const name = ref("");
const isDefault = ref(false);

watch(
  () => [open.value, props.initialName, props.initialIsDefault] as const,
  ([isOpen]) => {
    if (isOpen) {
      name.value = props.initialName;
      isDefault.value = props.initialIsDefault;
    }
  },
  { immediate: true },
);

const submit = () => {
  emit("submit", {
    name: name.value,
    isDefault: isDefault.value,
  });
};
</script>
