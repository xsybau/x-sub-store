<template>
  <UsersListScreen />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import UsersListScreen from "~/modules/AdminUsers/screens/UsersListScreen.vue";

const { t } = useI18n();

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

useHead(() => ({
  title: t("pages.users"),
}));
</script>
