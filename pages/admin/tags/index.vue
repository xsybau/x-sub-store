<template>
  <TagsListScreen />
</template>

<script setup lang="ts">
import TagsListScreen from "~/modules/AdminUsers/screens/TagsListScreen.vue";

definePageMeta({
  title: "Tags",
  layout: "admin",
  middleware: "auth",
});

useHead({
  title: "Tags",
});
</script>
