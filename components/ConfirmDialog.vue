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
          <UButton
            variant="ghost"
            :disabled="loading"
            @click="open = false"
          >
            {{ cancelLabel }}
          </UButton>
          <UButton
            :color="confirmColor"
            :loading="loading"
            @click="$emit('confirm')"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
  loading?: boolean;
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmColor: 'error',
  loading: false
});

defineEmits<{
  confirm: [];
}>();

const open = defineModel<boolean>('open', { default: false });
</script>
