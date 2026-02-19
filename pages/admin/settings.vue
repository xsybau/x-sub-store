<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Global Settings</h2>
      <p class="mt-1 text-sm text-muted">Manage upstream and static sources shared across all users.</p>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Global Upstreams</h3>
        </template>
        <UpstreamList scope="GLOBAL" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Global Static Nodes</h3>
        </template>
        <StaticNodeList scope="GLOBAL" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Global Settings',
  layout: 'admin',
  middleware: 'auth'
});
useHead({
  title: "Global Settings",
});
</script>
