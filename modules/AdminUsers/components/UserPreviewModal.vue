<template>
  <UModal
    v-model:open="open"
    fullscreen
    :title="t('adminUsers.userDetails.previewModal.title')"
    :description="t('adminUsers.userDetails.previewModal.description')"
  >
    <template #content>
      <div class="flex h-full flex-col p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xl font-bold">
            {{ t("adminUsers.userDetails.previewModal.heading") }}
          </h3>
          <UButton
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="open = false"
          />
        </div>

        <div v-if="previewLoading" class="flex-1 space-y-3">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-24 w-full" />
          <USkeleton class="h-64 w-full" />
        </div>

        <div v-else-if="previewData" class="flex-1 space-y-4 overflow-auto">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <UCard>
              <h4 class="font-bold text-gray-500">
                {{ t("adminUsers.userDetails.previewModal.totalNodes") }}
              </h4>
              <p class="text-2xl">{{ previewData.stats.uniqueNodes }}</p>
            </UCard>
            <UCard>
              <h4 class="font-bold text-gray-500">
                {{ t("adminUsers.userDetails.previewModal.rawNodes") }}
              </h4>
              <p class="text-2xl">{{ previewData.stats.totalRawNodes }}</p>
            </UCard>
            <UCard>
              <h4 class="font-bold text-gray-500">
                {{ t("adminUsers.userDetails.previewModal.upstreams") }}
              </h4>
              <p class="text-2xl">{{ previewData.stats.upstreams }}</p>
            </UCard>
          </div>

          <UCard>
            <template #header>
              <h4 class="font-bold">
                {{ t("adminUsers.userDetails.previewModal.upstreamStatus") }}
              </h4>
            </template>
            <UTable
              class="table-fixed"
              :data="previewData.upstreamStatus"
              :columns="previewStatusColumns"
            >
              <template #source-cell="{ row }">
                <UTooltip :text="row.original.source">
                  <p class="max-w-40 truncate font-medium sm:max-w-56">
                    {{ row.original.source }}
                  </p>
                </UTooltip>
              </template>

              <template #status-cell="{ row }">
                <UBadge
                  :color="row.original.status === 'OK' ? 'success' : 'error'"
                  variant="subtle"
                >
                  {{
                    row.original.status === "OK"
                      ? t("common.status.healthy")
                      : t("common.status.issue")
                  }}
                </UBadge>
              </template>

              <template #error-cell="{ row }">
                <span v-if="!row.original.error" class="text-xs text-muted">
                  {{ t("common.labels.noValue") }}
                </span>
                <UTooltip v-else :text="row.original.error">
                  <p
                    class="max-w-44 truncate font-mono text-xs text-error sm:max-w-[18rem]"
                  >
                    {{ row.original.error }}
                  </p>
                </UTooltip>
              </template>
            </UTable>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex justify-between">
                <h4 class="font-bold">
                  {{ t("adminUsers.userDetails.previewModal.nodes") }}
                </h4>
                <UButton size="xs" @click="emit('copyNodes')">
                  {{ t("adminUsers.userDetails.buttons.copyNodes") }}
                </UButton>
              </div>
            </template>
            <pre
              class="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-800"
              >{{ previewData.nodes.join("\n") }}</pre
            >
          </UCard>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { UserSubscriptionPreview } from "~/modules/AdminUsers/types/users";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  previewLoading: boolean;
  previewData: UserSubscriptionPreview | null;
  previewStatusColumns: Array<Record<string, unknown>>;
}>();

const emit = defineEmits<{
  copyNodes: [];
}>();

const { t } = useI18n();
</script>
