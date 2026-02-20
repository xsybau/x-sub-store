<template>
  <div v-if="tag">
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold">{{ tag.name }}</h2>
        <UBadge :color="tag.isDefault ? 'success' : 'neutral'" variant="subtle">
          {{ tag.isDefault ? "Default" : "Optional" }}
        </UBadge>
      </div>

      <div class="flex gap-2">
        <UButton variant="soft" :loading="savingTag" @click="saveTag"
          >Save Tag</UButton
        >
        <UButton color="error" variant="soft" @click="deleteDialogOpen = true"
          >Delete Tag</UButton
        >
      </div>
    </div>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">Tag Settings</h3>
      </template>

      <div class="space-y-4">
        <UFormField label="Tag Name">
          <UInput v-model="editState.name" required />
        </UFormField>
        <UCheckbox
          v-model="editState.isDefault"
          label="Default for new users"
        />
      </div>
    </UCard>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">Users In This Tag</h3>
      </template>

      <UTable :data="users" :columns="userColumns" :loading="usersPending">
        <template #isActive-cell="{ row }">
          <UBadge :color="row.original.isActive ? 'success' : 'error'">
            {{ row.original.isActive ? "Active" : "Inactive" }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            :to="`/admin/users/${row.original._id}`"
            size="xs"
            variant="ghost"
            icon="i-heroicons-eye"
          />
        </template>
      </UTable>
    </UCard>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">Apply Tag To Existing Users</h3>
      </template>

      <div class="space-y-4">
        <UFormField label="Select Users (Batch)">
          <UInputMenu
            v-model="selectedApplyUserIds"
            :items="allUserOptions"
            label-key="label"
            value-key="_id"
            :multiple="true"
            class="w-full"
            placeholder="Select users to apply this tag"
          />
          <p class="mt-1 text-xs text-muted">
            Matching users: {{ allUsers.length }} | Selected:
            {{ selectedApplyUserIds.length }}
          </p>
        </UFormField>

        <div class="flex flex-wrap gap-2">
          <UButton
            color="primary"
            :loading="applyingSelectedUsers"
            :disabled="!selectedApplyUserIds.length || applyingAllUsers"
            @click="applyToSelectedUsers"
          >
            Apply To Selected Users
          </UButton>
          <UButton
            color="primary"
            variant="soft"
            :loading="applyingAllUsers"
            :disabled="applyingSelectedUsers || !allUsers.length"
            @click="applyToAllUsers"
          >
            Apply To All Existing Users
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-bold">Bulk User Actions</h3>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="warning"
          :loading="runningAction === 'DEACTIVATE_USERS'"
          @click="openActionDialog('DEACTIVATE_USERS')"
        >
          Deactivate Users
        </UButton>
        <UButton
          color="warning"
          variant="soft"
          :loading="runningAction === 'ROTATE_TOKENS'"
          @click="openActionDialog('ROTATE_TOKENS')"
        >
          Rotate Tokens
        </UButton>
        <UButton
          color="error"
          :loading="runningAction === 'DELETE_USERS'"
          @click="openActionDialog('DELETE_USERS')"
        >
          Delete Users
        </UButton>
      </div>
    </UCard>

    <div class="grid grid-cols-1 gap-8">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Tag Upstreams</h3>
        </template>
        <UpstreamManager scope="TAG" :tag-id="tag._id" />
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Tag Static Nodes</h3>
        </template>
        <StaticNodeManager scope="TAG" :tag-id="tag._id" />
      </UCard>
    </div>

    <ConfirmDialog
      v-model:open="actionDialogOpen"
      :title="actionDialogTitle"
      :description="actionDialogDescription"
      :confirm-label="actionDialogConfirmLabel"
      :confirm-color="actionDialogColor"
      :loading="runningAction !== null"
      @confirm="runAction"
    />

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      title="Delete Tag"
      description="Deleting this tag detaches all users and removes all tag-scoped sources."
      confirm-label="Delete Tag"
      confirm-color="error"
      :loading="deletingTag"
      @confirm="deleteTag"
    />
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from "ofetch";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import StaticNodeManager from "~/modules/AdminSources/components/StaticNodeManager.vue";
import UpstreamManager from "~/modules/AdminSources/components/UpstreamManager.vue";
import type {
  TagBulkAction,
  TagItem,
  UpdateTagInput,
} from "~/modules/AdminUsers/types/tags";
import type { UserItem } from "~/modules/AdminUsers/types/users";
import {
  applyTagToUsersApi,
  deleteTagApi,
  getTagApi,
  runTagActionApi,
  updateTagApi,
} from "~/modules/AdminUsers/utils/tagsApi";
import { listUsersApi } from "~/modules/AdminUsers/utils/usersApi";

interface TagEditState {
  name: string;
  isDefault: boolean;
}

const route = useRoute();
const toast = useToast();

const requestHeaders = import.meta.server
  ? useRequestHeaders(["cookie"])
  : undefined;

const tagId = computed(() => {
  const value = route.params.id;
  return typeof value === "string" ? value : "";
});

const { data: tag, refresh: refreshTag } = useAsyncData<TagItem | null>(
  () => `admin-tag-${tagId.value}`,
  async () => {
    if (!tagId.value) {
      throw createError({ statusCode: 400, statusMessage: "Invalid tag id" });
    }

    return getTagApi(tagId.value);
  },
  {
    watch: [tagId],
    default: () => null,
  },
);

const {
  data: usersData,
  status: usersStatus,
  refresh: refreshUsers,
} = useAsyncData<UserItem[]>(
  () => `admin-tag-users-${tagId.value}`,
  async () => {
    if (!tagId.value) {
      return [];
    }

    return listUsersApi({
      headers: requestHeaders,
      tagId: tagId.value,
    });
  },
  {
    watch: [tagId],
    default: (): UserItem[] => [],
  },
);

const {
  data: allUsersData,
  status: allUsersStatus,
  refresh: refreshAllUsers,
} = useAsyncData<UserItem[]>(
  "admin-all-users-for-tag-apply",
  async () => {
    return listUsersApi({ headers: requestHeaders });
  },
  {
    default: (): UserItem[] => [],
  },
);

const editState = ref<TagEditState>({
  name: "",
  isDefault: false,
});

watch(
  () => tag.value,
  (nextTag) => {
    if (!nextTag) {
      return;
    }

    editState.value = {
      name: nextTag.name,
      isDefault: nextTag.isDefault,
    };
  },
  { immediate: true },
);

const users = computed(() => usersData.value);
const allUsers = computed(() => allUsersData.value);
const usersPending = computed(() => {
  return usersStatus.value === "pending" || allUsersStatus.value === "pending";
});

const allUserOptions = computed(() => {
  return allUsers.value.map((user) => ({
    _id: user._id,
    label: user.email ? `${user.label} (${user.email})` : user.label,
  }));
});

const savePayload = computed<UpdateTagInput>(() => {
  return {
    name: editState.value.name,
    isDefault: editState.value.isDefault,
  };
});

const savingTag = ref(false);
const deletingTag = ref(false);
const applyingSelectedUsers = ref(false);
const applyingAllUsers = ref(false);
const selectedApplyUserIds = ref<string[]>([]);

const actionDialogOpen = ref(false);
const pendingAction = ref<TagBulkAction | null>(null);
const runningAction = ref<TagBulkAction | null>(null);

const deleteDialogOpen = ref(false);

const userColumns = [
  { accessorKey: "label", header: "User" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "isActive", header: "Status" },
  { accessorKey: "actions", header: "Actions" },
];

useHead(() => ({
  title: tag.value ? `${tag.value.name} - Tags` : "Tag Details",
}));

const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || !error) {
    return "Unexpected error";
  }

  const candidate = error as FetchError;
  const message =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as { message?: string }).message
      : undefined;

  return message || candidate.message || "Unexpected error";
};

const saveTag = async () => {
  if (!tag.value) {
    return;
  }

  savingTag.value = true;
  try {
    await updateTagApi(tag.value._id, savePayload.value);
    await refreshTag();
    toast.add({ title: "Tag updated", color: "success" });
  } catch (error) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    savingTag.value = false;
  }
};

const openActionDialog = (action: TagBulkAction) => {
  pendingAction.value = action;
  actionDialogOpen.value = true;
};

const actionDialogTitle = computed(() => {
  if (pendingAction.value === "DELETE_USERS") {
    return "Delete Tagged Users";
  }
  if (pendingAction.value === "DEACTIVATE_USERS") {
    return "Deactivate Tagged Users";
  }
  return "Rotate Tokens For Tagged Users";
});

const actionDialogDescription = computed(() => {
  if (pendingAction.value === "DELETE_USERS") {
    return "This permanently deletes users that contain this tag.";
  }
  if (pendingAction.value === "DEACTIVATE_USERS") {
    return "This deactivates users that contain this tag.";
  }
  return "This rotates tokens for users that contain this tag.";
});

const actionDialogConfirmLabel = computed(() => {
  if (pendingAction.value === "DELETE_USERS") {
    return "Delete Users";
  }
  if (pendingAction.value === "DEACTIVATE_USERS") {
    return "Deactivate Users";
  }
  return "Rotate Tokens";
});

const actionDialogColor = computed<"warning" | "error">(() => {
  return pendingAction.value === "DELETE_USERS" ? "error" : "warning";
});

const runAction = async () => {
  if (!tag.value || !pendingAction.value) {
    return;
  }

  runningAction.value = pendingAction.value;

  try {
    const result = await runTagActionApi(tag.value._id, pendingAction.value);
    actionDialogOpen.value = false;
    pendingAction.value = null;
    await refreshUsers();
    toast.add({
      title: "Action completed",
      description: `Matched ${String(result.matchedUsers)} users, affected ${String(result.affectedUsers)}`,
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Action failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    runningAction.value = null;
  }
};

const deleteTag = async () => {
  if (!tag.value) {
    return;
  }

  deletingTag.value = true;
  try {
    const result = await deleteTagApi(tag.value._id);
    deleteDialogOpen.value = false;
    toast.add({
      title: "Tag deleted",
      description: `${String(result.detachedUsers)} users detached, ${String(result.deletedUpstreams)} upstreams removed, ${String(result.deletedStaticNodes)} static nodes removed`,
      color: "success",
    });
    await navigateTo("/admin/tags");
  } catch (error) {
    toast.add({
      title: "Delete failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    deletingTag.value = false;
  }
};

const applyToSelectedUsers = async () => {
  if (!tag.value || !selectedApplyUserIds.value.length) {
    return;
  }

  applyingSelectedUsers.value = true;
  try {
    const result = await applyTagToUsersApi(tag.value._id, {
      mode: "SELECTED",
      userIds: selectedApplyUserIds.value,
    });
    selectedApplyUserIds.value = [];
    await Promise.all([refreshUsers(), refreshAllUsers()]);
    toast.add({
      title: "Tag applied to selected users",
      description: `Matched ${String(result.matchedUsers)} users, affected ${String(result.affectedUsers)}`,
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Apply failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    applyingSelectedUsers.value = false;
  }
};

const applyToAllUsers = async () => {
  if (!tag.value) {
    return;
  }

  applyingAllUsers.value = true;
  try {
    const result = await applyTagToUsersApi(tag.value._id, {
      mode: "ALL",
    });
    await Promise.all([refreshUsers(), refreshAllUsers()]);
    toast.add({
      title: "Tag applied to all users",
      description: `Matched ${String(result.matchedUsers)} users, affected ${String(result.affectedUsers)}`,
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Apply failed",
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    applyingAllUsers.value = false;
  }
};
</script>
