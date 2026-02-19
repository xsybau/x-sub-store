<script setup lang="ts">
definePageMeta({
  title: 'Home',
  middleware: [
    function () {
      return navigateTo('/admin');
    }
  ]
})
useHead({
  title: "Home",
});
</script>
