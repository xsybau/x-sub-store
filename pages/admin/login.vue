<template>
  <AdminLoginScreen />
</template>

<script setup lang="ts">
import AdminLoginScreen from "~/modules/AdminAuth/screens/AdminLoginScreen.vue";

definePageMeta({
  title: "Admin Login",
  middleware: "auth",
});

useHead({
  title: "Admin Login",
});
</script>
