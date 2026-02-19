<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/admin/users');
    }
  ]
})
</script>
