<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">{{ t("adminSettings.title") }}</h2>
      <p class="mt-1 text-sm text-muted">
        {{ t("adminSettings.description") }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ t("adminSettings.globalUpstreams") }}
          </h3>
        </template>
        <UpstreamManager scope="GLOBAL" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">
            {{ t("adminSettings.globalStaticNodes") }}
          </h3>
        </template>
        <StaticNodeManager scope="GLOBAL" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import StaticNodeManager from "~/modules/AdminSources/components/StaticNodeManager.vue";
import UpstreamManager from "~/modules/AdminSources/components/UpstreamManager.vue";

const { t } = useI18n();
</script>
