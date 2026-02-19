<template>
  <div v-if="user">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold">{{ user.label }}</h2>
        <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle">
          {{ user.isActive ? "Active" : "Inactive" }}
        </UBadge>
      </div>
      <div class="flex space-x-2">
        <UButton @click="preview" variant="soft" :loading="previewLoading"
          >Preview Subscription</UButton
        >
        <UButton
          @click="toggleUserStatus"
          :color="user.isActive ? 'warning' : 'success'"
          :loading="togglingStatus"
          :icon="
            user.isActive
              ? 'i-heroicons-pause-circle'
              : 'i-heroicons-play-circle'
          "
          variant="soft"
        >
          {{ user.isActive ? "Deactivate" : "Activate" }}
        </UButton>
        <UButton @click="deleteDialogOpen = true" color="error"
          >Delete User</UButton
        >
      </div>
    </div>

    <!-- Token Section -->
    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">Subscription URL</h3>
      </template>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <UTooltip :text="subUrl">
          <p
            class="min-w-0 flex-1 truncate rounded-md border border-accented/60 bg-muted/30 px-3 py-2 font-mono text-xs text-toned"
          >
            {{ subUrl }}
          </p>
        </UTooltip>
        <div class="flex gap-2">
          <UButton @click="copyUrl" icon="i-heroicons-clipboard">Copy</UButton>
          <UButton
            @click="rotateDialogOpen = true"
            color="warning"
            icon="i-heroicons-arrow-path"
            >Rotate Token</UButton
          >
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2 font-mono">
        Token: {{ user.token }}
      </p>
    </UCard>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">User Upstreams</h3>
        </template>
        <UpstreamList scope="USER" :userId="user._id" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">User Static Nodes</h3>
        </template>
        <StaticNodeList scope="USER" :userId="user._id" />
      </UCard>
    </div>

    <!-- Preview Modal -->
    <UModal
      v-model:open="showPreview"
      fullscreen
      title="Subscription Preview"
      description="Inspect generated nodes and upstream status for this user."
    >
      <template #content>
        <div class="p-6 h-full flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">Subscription Preview</h3>
            <UButton
              @click="showPreview = false"
              icon="i-heroicons-x-mark"
              variant="ghost"
            />
          </div>

          <div v-if="previewLoading" class="flex-1 space-y-3">
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-24 w-full" />
            <USkeleton class="h-64 w-full" />
          </div>

          <div v-else-if="previewData" class="flex-1 overflow-auto space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <UCard>
                <h4 class="font-bold text-gray-500">Total Nodes</h4>
                <p class="text-2xl">{{ previewData.stats.uniqueNodes }}</p>
              </UCard>
              <UCard>
                <h4 class="font-bold text-gray-500">Raw Nodes</h4>
                <p class="text-2xl">{{ previewData.stats.totalRawNodes }}</p>
              </UCard>
              <UCard>
                <h4 class="font-bold text-gray-500">Upstreams</h4>
                <p class="text-2xl">{{ previewData.stats.upstreams }}</p>
              </UCard>
            </div>

            <UCard>
              <template #header>
                <h4 class="font-bold">Upstream Status</h4>
              </template>
              <UTable
                class="table-fixed"
                :data="previewData.upstreamStatus"
                :columns="previewStatusColumns"
              >
                <template #source-cell="{ row }">
                  <UTooltip :text="row.original.source">
                    <p
                      class="max-w-[10rem] sm:max-w-[14rem] truncate font-medium"
                    >
                      {{ row.original.source }}
                    </p>
                  </UTooltip>
                </template>
                <template #status-cell="{ row }">
                  <UBadge
                    :color="row.original.status === 'OK' ? 'success' : 'error'"
                    variant="subtle"
                  >
                    {{ row.original.status === "OK" ? "Healthy" : "Issue" }}
                  </UBadge>
                </template>
                <template #error-cell="{ row }">
                  <span v-if="!row.original.error" class="text-xs text-muted"
                    >-</span
                  >
                  <UTooltip v-else :text="row.original.error">
                    <p
                      class="max-w-[11rem] sm:max-w-[18rem] truncate font-mono text-xs text-error"
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
                  <h4 class="font-bold">Nodes</h4>
                  <UButton size="xs" @click="copyNodes">Copy</UButton>
                </div>
              </template>
              <pre
                class="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96"
                >{{ previewData.nodes.join("\n") }}</pre
              >
            </UCard>
          </div>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="rotateDialogOpen"
      title="Rotate User Token"
      description="This will invalidate the current subscription URL and issue a new one."
      confirm-label="Rotate Token"
      confirm-color="warning"
      :loading="rotatingToken"
      @confirm="rotateToken"
    />

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete User"
      description="This will permanently remove the user and all of their data."
      confirm-label="Delete User"
      confirm-color="error"
      :loading="deletingUser"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const route = useRoute();
const { data: user, refresh } = await useFetch(
  `/api/admin/users/${route.params.id}`,
  {
    server: false,
  },
);
const toast = useToast();
const showPreview = ref(false);
const previewData = ref<any>(null);
const previewLoading = ref(false);
const rotateDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const rotatingToken = ref(false);
const togglingStatus = ref(false);
const deletingUser = ref(false);
const previewStatusColumns = [
  { accessorKey: "source", header: "Upstream" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "error", header: "Error" },
];

const subUrl = computed(() => {
  if (!user.value) return "";
  // Construct URL. In browser, window.location.origin is available
  if (import.meta.client) {
    return `${window.location.origin}/subs/${user.value.token}`;
  }
  return `/subs/${user.value.token}`;
});

const copyUrl = () => {
  navigator.clipboard.writeText(subUrl.value);
  toast.add({ title: "Copied", color: "success" });
};

const copyNodes = () => {
  if (previewData.value?.nodes) {
    navigator.clipboard.writeText(previewData.value.nodes.join("\n"));
    toast.add({ title: "Copied Nodes", color: "success" });
  }
};

const rotateToken = async () => {
  rotatingToken.value = true;
  try {
    await $fetch(`/api/admin/users/${route.params.id}/rotate-token`, {
      method: "POST",
    });
    refresh();
    rotateDialogOpen.value = false;
    toast.add({ title: "Token Rotated", color: "success" });
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message, color: "error" });
  } finally {
    rotatingToken.value = false;
  }
};

const toggleUserStatus = async () => {
  if (!user.value) return;
  togglingStatus.value = true;
  try {
    await $fetch(`/api/admin/users/${route.params.id}`, {
      method: "PUT",
      body: { isActive: !user.value.isActive },
    });
    await refresh();
    toast.add({
      title: user.value.isActive ? "User activated" : "User deactivated",
      color: "success",
    });
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message, color: "error" });
  } finally {
    togglingStatus.value = false;
  }
};

const deleteUser = async () => {
  deletingUser.value = true;
  try {
    await $fetch(`/api/admin/users/${route.params.id}`, { method: "DELETE" });
    deleteDialogOpen.value = false;
    navigateTo("/admin/users");
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message, color: "error" });
  } finally {
    deletingUser.value = false;
  }
};

const preview = async () => {
  previewLoading.value = true;
  showPreview.value = true;
  previewData.value = null;
  try {
    const data: any = await $fetch(
      `/api/admin/users/${route.params.id}/preview`,
    );
    previewData.value = data;
  } catch (e: any) {
    showPreview.value = false;
    toast.add({
      title: "Preview Failed",
      description: e.message,
      color: "error",
    });
  } finally {
    previewLoading.value = false;
  }
};
</script>
