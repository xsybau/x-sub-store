<template>
  <UModal
    v-model:open="open"
    :title="
      t('adminUsers.usersList.previewModal.title', {
        label:
          previewTargetLabel ||
          t('adminUsers.usersList.previewModal.userFallback'),
      })
    "
    :description="t('adminUsers.usersList.previewModal.description')"
  >
    <template #content>
      <div class="space-y-4 p-6">
        <div v-if="previewingUserId" class="space-y-3">
          <USkeleton class="h-5 w-1/3" />
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-24 w-full" />
        </div>

        <div v-else-if="previewData" class="space-y-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <UCard>
              <p class="text-xs uppercase tracking-wide text-muted">
                {{ t("adminUsers.usersList.previewModal.uniqueNodes") }}
              </p>
              <p class="mt-1 text-xl font-semibold">
                {{ previewData.stats.uniqueNodes }}
              </p>
            </UCard>
            <UCard>
              <p class="text-xs uppercase tracking-wide text-muted">
                {{ t("adminUsers.usersList.previewModal.rawNodes") }}
              </p>
              <p class="mt-1 text-xl font-semibold">
                {{ previewData.stats.totalRawNodes }}
              </p>
            </UCard>
            <UCard>
              <p class="text-xs uppercase tracking-wide text-muted">
                {{ t("adminUsers.usersList.previewModal.upstreams") }}
              </p>
              <p class="mt-1 text-xl font-semibold">
                {{ previewData.stats.upstreams }}
              </p>
            </UCard>
          </div>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h4 class="font-semibold">
                  {{ t("adminUsers.usersList.previewModal.firstNodes") }}
                </h4>
                <UButton
                  v-if="previewTargetId"
                  :to="`/admin/users/${previewTargetId}`"
                  size="xs"
                  variant="soft"
                >
                  {{ t("adminUsers.usersList.previewModal.openFullPage") }}
                </UButton>
              </div>
            </template>
            <pre
              class="max-h-56 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-800"
              >{{ (previewData.nodes || []).slice(0, 8).join("\n") }}</pre
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
  previewData: UserSubscriptionPreview | null;
  previewingUserId: string | null;
  previewTargetLabel: string;
  previewTargetId: string | null;
}>();

const { t } = useI18n();
</script>
