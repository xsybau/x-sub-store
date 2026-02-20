<template>
  <TagsListScreen />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TagsListScreen from "~/modules/AdminUsers/screens/TagsListScreen.vue";

const { t } = useI18n();

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

useHead(() => ({
  title: t("pages.tags"),
}));
</script>
