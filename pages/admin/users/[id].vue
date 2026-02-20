<template>
  <UserDetailsScreen />
</template>

<script setup lang="ts">
import UserDetailsScreen from "~/modules/AdminUsers/screens/UserDetailsScreen.vue";

definePageMeta({
  title: "Users",
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
const userPageTitle = computed(() => {
  const label = user.value?.label?.trim();
  return label ? `${label} - Users` : "Users";
});
useHead(() => ({
  title: userPageTitle.value,
}));
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
