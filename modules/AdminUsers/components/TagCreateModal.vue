<template>
  <UModal
    v-model:open="open"
    :title="t('adminUsers.tagsList.createModal.title')"
    :description="t('adminUsers.tagsList.createModal.description')"
  >
    <template #content>
      <div class="p-6">
        <form class="w-full space-y-4" @submit.prevent="submit">
          <UFormField
            :label="t('adminUsers.tagsList.createModal.tagNameLabel')"
            class="w-full"
          >
            <UInput v-model="name" class="w-full" required />
          </UFormField>
          <UCheckbox
            v-model="isDefault"
            :label="t('adminUsers.tagsList.createModal.defaultCheckbox')"
          />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="open = false">
              {{ t("common.actions.cancel") }}
            </UButton>
            <UButton type="submit" :loading="loading">
              {{ t("common.actions.create") }}
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

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: TagModalPayload];
}>();

const { t } = useI18n();

const name = ref("");
const isDefault = ref(false);

const reset = () => {
  name.value = "";
  isDefault.value = false;
};

const submit = () => {
  emit("submit", {
    name: name.value,
    isDefault: isDefault.value,
  });
};

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      reset();
    }
  },
);
</script>
