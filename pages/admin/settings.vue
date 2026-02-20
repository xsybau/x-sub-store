<template>
  <SettingsScreen />
</template>

<script setup lang="ts">
import SettingsScreen from "~/modules/AdminSettings/screens/SettingsScreen.vue";

definePageMeta({
  title: "Global Settings",
  layout: "admin",
  middleware: "auth",
});

useHead({
  title: "Global Settings",
});
</script>
