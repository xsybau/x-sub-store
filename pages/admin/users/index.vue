<template>
  <UsersListScreen />
</template>

<script setup lang="ts">
import UsersListScreen from "~/modules/AdminUsers/screens/UsersListScreen.vue";

definePageMeta({
  title: "Users",
  layout: "admin",
  middleware: "auth",
});

useHead({
  title: "Users",
});
</script>
