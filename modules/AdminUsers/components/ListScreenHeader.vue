<template>
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-2xl font-bold">{{ title }}</h2>
    <UButton @click="emit('action')">
      {{ actionLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  actionLabel: string;
}>();

const emit = defineEmits<{
  action: [];
}>();
</script>
