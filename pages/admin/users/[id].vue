<template>
  <UserDetailsScreen />
</template>

<script setup lang="ts">
import UserDetailsScreen from "~/modules/AdminUsers/screens/UserDetailsScreen.vue";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>
