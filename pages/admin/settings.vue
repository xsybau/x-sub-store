<template>
  <SettingsScreen />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SettingsScreen from "~/modules/AdminSettings/screens/SettingsScreen.vue";

const { t } = useI18n();

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

useHead(() => ({
  title: t("pages.adminSettings"),
}));
</script>
