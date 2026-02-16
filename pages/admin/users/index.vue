<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Users</h2>
      <UButton @click="isOpen = true">Add User</UButton>
    </div>

    <UTable :data="users" :columns="columns" :loading="pending">
      <template #isActive-cell="{ row }">
        <UBadge :color="row.original.isActive ? 'success' : 'error'">{{
          row.original.isActive ? "Active" : "Inactive"
        }}</UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex space-x-2">
          <UButton
            @click="previewFromList(row.original)"
            variant="ghost"
            icon="i-heroicons-eye"
            :loading="previewingUserId === row.original._id"
            title="Preview Subscription"
          />
          <UButton
            @click="toggleUserActive(row.original)"
            variant="ghost"
            :color="row.original.isActive ? 'warning' : 'success'"
            :icon="
              row.original.isActive
                ? 'i-heroicons-pause-circle'
                : 'i-heroicons-play-circle'
            "
            :loading="togglingUserId === row.original._id"
            :title="row.original.isActive ? 'Deactivate User' : 'Activate User'"
          />
          <UButton
            :to="`/admin/users/${row.original._id}`"
            variant="ghost"
            icon="i-heroicons-pencil-square"
          />
          <UButton
            @click="openDeleteDialog(row.original._id)"
            variant="ghost"
            color="error"
            icon="i-heroicons-trash"
          />
        </div>
      </template>
    </UTable>

    <!-- Create User Modal -->
    <UModal
      v-model:open="isOpen"
      title="Create User"
      description="Add a new user with an optional email address."
    >
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-bold mb-4">Create User</h3>
          <form @submit.prevent="createUser" class="space-y-4">
            <UFormField label="Label">
              <UInput v-model="newUser.label" required />
            </UFormField>
            <UFormField label="Email">
              <UInput v-model="newUser.email" type="email" />
            </UFormField>
            <div class="flex justify-end space-x-2">
              <UButton variant="ghost" @click="isOpen = false">Cancel</UButton>
              <UButton type="submit" :loading="creating">Create</UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="previewModalOpen"
      :title="`Preview: ${previewTargetLabel || 'User'}`"
      description="Quick subscription preview directly from the users table."
    >
      <template #content>
        <div class="p-6 space-y-4">
          <div v-if="previewingUserId" class="space-y-3">
            <USkeleton class="h-5 w-1/3" />
            <USkeleton class="h-20 w-full" />
            <USkeleton class="h-24 w-full" />
          </div>

          <div v-else-if="previewData" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  Unique Nodes
                </p>
                <p class="text-xl font-semibold mt-1">
                  {{ previewData.stats.uniqueNodes }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  Raw Nodes
                </p>
                <p class="text-xl font-semibold mt-1">
                  {{ previewData.stats.totalRawNodes }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs uppercase tracking-wide text-muted">
                  Upstreams
                </p>
                <p class="text-xl font-semibold mt-1">
                  {{ previewData.stats.upstreams }}
                </p>
              </UCard>
            </div>

            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold">First Nodes</h4>
                  <UButton
                    v-if="previewTargetId"
                    :to="`/admin/users/${previewTargetId}`"
                    size="xs"
                    variant="soft"
                  >
                    Open Full Page
                  </UButton>
                </div>
              </template>
              <pre
                class="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto max-h-56"
                >{{ (previewData.nodes || []).slice(0, 8).join("\n") }}</pre
              >
            </UCard>
          </div>
        </div>
      </template>
    </UModal>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete User"
      description="This will permanently delete the user and all related data."
      confirm-label="Delete User"
      confirm-color="error"
      :loading="deletingUser"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Users",
  layout: "admin",
  middleware: "auth",
});
useHead({
  title: "Users",
});

interface UserRow {
  _id: string;
  label: string;
  email?: string;
  isActive: boolean;
}

const columns = [
  { accessorKey: "label", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "isActive", header: "Status" },
  { accessorKey: "actions", header: "Actions" },
];

const {
  data: usersRaw,
  refresh,
  pending,
} = await useFetch<any[]>("/api/admin/users", {
  server: false,
});
const users = computed<UserRow[]>(() => {
  return (usersRaw.value || []).map((user: any) => ({
    _id: String(user?._id || ""),
    label: user?.label || "",
    email: user?.email || "",
    isActive: Boolean(user?.isActive),
  }));
});
const isOpen = ref(false);
const creating = ref(false);
const newUser = ref({ label: "", email: "" });
const previewModalOpen = ref(false);
const previewData = ref<any>(null);
const previewTargetId = ref<string | null>(null);
const previewTargetLabel = ref("");
const previewingUserId = ref<string | null>(null);
const togglingUserId = ref<string | null>(null);
const deleteDialogOpen = ref(false);
const deletingUserId = ref<string | null>(null);
const deletingUser = ref(false);
const toast = useToast();

const createUser = async () => {
  creating.value = true;
  try {
    await $fetch("/api/admin/users", {
      method: "POST",
      body: newUser.value,
    });
    isOpen.value = false;
    newUser.value = { label: "", email: "" };
    refresh();
    toast.add({
      title: "User created",
      description: `Token generated successfully`,
    });
  } catch (e: any) {
    toast.add({ title: "Error", description: e.data?.message, color: "error" });
  } finally {
    creating.value = false;
  }
};

const previewFromList = async (user: UserRow) => {
  previewTargetId.value = user._id;
  previewTargetLabel.value = user.label || "User";
  previewData.value = null;
  previewModalOpen.value = true;
  previewingUserId.value = user._id;

  try {
    const data: any = await $fetch(`/api/admin/users/${user._id}/preview`);
    previewData.value = data;
  } catch (e: any) {
    previewModalOpen.value = false;
    toast.add({
      title: "Preview Failed",
      description: e?.data?.message || e.message,
      color: "error",
    });
  } finally {
    previewingUserId.value = null;
  }
};

const openDeleteDialog = (id: string) => {
  deletingUserId.value = id;
  deleteDialogOpen.value = true;
};

const toggleUserActive = async (user: UserRow) => {
  togglingUserId.value = user._id;
  try {
    await $fetch(`/api/admin/users/${user._id}`, {
      method: "PUT",
      body: { isActive: !user.isActive },
    });
    await refresh();
    toast.add({
      title: user.isActive ? "User deactivated" : "User activated",
      color: "success",
    });
  } catch (e: any) {
    toast.add({
      title: "Status update failed",
      description: e?.data?.message || e.message,
      color: "error",
    });
  } finally {
    togglingUserId.value = null;
  }
};

const deleteUser = async () => {
  if (!deletingUserId.value) return;
  deletingUser.value = true;
  try {
    await $fetch(`/api/admin/users/${deletingUserId.value}`, {
      method: "DELETE",
    });
    refresh();
    deleteDialogOpen.value = false;
    deletingUserId.value = null;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.data?.message, color: "error" });
  } finally {
    deletingUser.value = false;
  }
};
</script>
