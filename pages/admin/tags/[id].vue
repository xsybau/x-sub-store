<template>
  <TagDetailsScreen />
</template>

<script setup lang="ts">
import TagDetailsScreen from "~/modules/AdminUsers/screens/TagDetailsScreen.vue";

definePageMeta({
  title: "Tag Details",
  layout: "admin",
  middleware: "auth",
});
</script>
