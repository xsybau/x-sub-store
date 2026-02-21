<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { getLocaleDirection, normalizeLocale } from "~/i18n/config";

const { locale } = useI18n();
const normalizedLocale = computed(() => normalizeLocale(locale.value));

useHead(() => ({
  htmlAttrs: {
    lang: normalizedLocale.value,
    dir: getLocaleDirection(normalizedLocale.value),
  },
}));
</script>
