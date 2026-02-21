<template>
  <UModal
    v-model:open="open"
    :title="t('adminUsers.usersList.createModal.title')"
    :description="t('adminUsers.usersList.createModal.description')"
  >
    <template #content>
      <div class="p-6">
        <h3 class="mb-4 text-lg font-bold">
          {{ t("adminUsers.usersList.createModal.heading") }}
        </h3>
        <form class="w-full space-y-4" @submit.prevent="submit">
          <UFormField
            :label="t('adminUsers.usersList.createModal.labelField')"
            class="w-full"
          >
            <UInput v-model="form.label" class="w-full" required />
          </UFormField>
          <UFormField
            :label="t('adminUsers.usersList.createModal.emailField')"
            class="w-full"
          >
            <UInput v-model="form.email" class="w-full" type="email" />
          </UFormField>
          <UFormField
            :label="t('adminUsers.usersList.createModal.descriptionField')"
            class="w-full"
          >
            <UTextarea
              v-model="form.description"
              class="w-full"
              :rows="3"
              :maxlength="500"
              :placeholder="
                t('adminUsers.usersList.createModal.descriptionPlaceholder')
              "
            />
          </UFormField>
          <UFormField
            :label="t('adminUsers.usersList.createModal.tagsField')"
            class="w-full"
          >
            <UInputMenu
              v-model="form.tagIds"
              :items="tags"
              label-key="name"
              value-key="_id"
              :multiple="true"
              :placeholder="
                t('adminUsers.usersList.createModal.tagsPlaceholder')
              "
              class="w-full"
            />
            <p class="mt-1 text-xs text-muted">
              {{ t("adminUsers.usersList.createModal.tagsHint") }}
            </p>
          </UFormField>
          <div class="flex justify-end space-x-2">
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
import type { TagItem } from "~/modules/AdminUsers/types/tags";
import type { CreateUserInput } from "~/modules/AdminUsers/types/users";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  tags: TagItem[];
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateUserInput];
}>();

const { t } = useI18n();

const form = reactive<CreateUserInput>({
  label: "",
  email: "",
  description: "",
  tagIds: [],
});

const resetForm = () => {
  form.label = "";
  form.email = "";
  form.description = "";
  form.tagIds = [];
};

const submit = () => {
  emit("submit", {
    label: form.label,
    email: form.email,
    description: form.description,
    tagIds: form.tagIds ? [...form.tagIds] : [],
  });
};

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
  },
);

defineExpose({
  resetForm,
});
</script>
