<template>
  <AdminLoginScreen />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import AdminLoginScreen from "~/modules/AdminAuth/screens/AdminLoginScreen.vue";

const { t } = useI18n();

definePageMeta({
  middleware: "auth",
});

useHead(() => ({
  title: t("pages.adminLogin"),
}));
</script>
