<template>
  <UserDetailsScreen />
</template>

<script setup lang="ts">
import UserDetailsScreen from "~/modules/AdminUsers/screens/UserDetailsScreen.vue";

definePageMeta({
  title: "Users",
  layout: "admin",
  middleware: "auth",
});
</script>
