<template>
  <TagDetailsScreen />
</template>

<script setup lang="ts">
import TagDetailsScreen from "~/modules/AdminUsers/screens/TagDetailsScreen.vue";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>
