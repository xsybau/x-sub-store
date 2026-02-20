<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :dismissible="!loading"
  >
    <template #content>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-highlighted">{{ title }}</h3>
        <p class="mt-2 text-sm text-muted">{{ description }}</p>

        <div class="mt-6 flex justify-end gap-2">
          <UButton variant="ghost" :disabled="loading" @click="open = false">
            {{ resolvedCancelLabel }}
          </UButton>
          <UButton
            :color="confirmColor"
            :loading="loading"
            @click="$emit('confirm')"
          >
            {{ resolvedConfirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?:
      | "primary"
      | "secondary"
      | "success"
      | "info"
      | "warning"
      | "error"
      | "neutral";
    loading?: boolean;
  }>(),
  {
    confirmLabel: "",
    cancelLabel: "",
    confirmColor: "error",
    loading: false,
  },
);

defineEmits<{
  confirm: [];
}>();

const open = defineModel<boolean>("open", { default: false });
const { t } = useI18n();

const resolvedConfirmLabel = computed(() => {
  return props.confirmLabel || t("common.actions.confirm");
});

const resolvedCancelLabel = computed(() => {
  return props.cancelLabel || t("common.actions.cancel");
});
</script>
