<template>
  <div class="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:hidden">
    <UButton
      color="primary"
      variant="solid"
      class="rounded-full px-5 py-2 shadow-lg shadow-primary/20"
      @click="emit('toggle')"
    >
      <UIcon
        :name="open ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
        class="size-4"
      />
      <span>
        {{
          open
            ? t("shell.admin.mobileMenu.close")
            : t("shell.admin.mobileMenu.open")
        }}
      </span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const { t } = useI18n();
</script>
