<script setup lang="ts">
definePageMeta({
  title: "Admin",
  middleware: [
    function () {
      return navigateTo("/admin/users");
    },
  ],
});
useHead({
  title: "Admin",
});
</script>
