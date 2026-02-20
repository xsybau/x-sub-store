import { useI18n } from "vue-i18n";
import type { FetchError } from "ofetch";
import type {
  SourceScope,
  UpstreamItem,
} from "~/modules/AdminSources/types/sources";
import {
  createUpstreamApi,
  deleteUpstreamApi,
  listUpstreamsApi,
  testUpstreamFetchApi,
  updateUpstreamApi,
} from "~/modules/AdminSources/utils/sourcesApi";

interface UseUpstreamManagerOptions {
  scope: SourceScope;
  userId?: string;
  tagId?: string;
}

interface UpstreamFormState {
  name: string;
  url: string;
}

const getInitialUpstreamForm = (): UpstreamFormState => ({
  name: "",
  url: "",
});

export const useUpstreamManager = (options: UseUpstreamManagerOptions) => {
  const toast = useToast();
  const { t } = useI18n();
  const { locale } = useAppLocale();

  const getErrorMessage = (error: unknown): string => {
    if (typeof error !== "object" || !error) {
      return t("common.errors.unknown");
    }

    const candidate = error as FetchError;
    const message =
      candidate.data && typeof candidate.data === "object"
        ? (candidate.data as { message?: string }).message
        : undefined;

    if (message) {
      return message;
    }

    return candidate.message || t("common.errors.unknown");
  };

  const query = computed(() => ({
    scope: options.scope,
    userId: options.userId,
    tagId: options.tagId,
  }));

  const {
    data: upstreams,
    status,
    refresh,
  } = useAsyncData<UpstreamItem[]>(
    () =>
      `admin-upstreams-${query.value.scope}-${query.value.userId || "none"}-${query.value.tagId || "none"}`,
    () => listUpstreamsApi(query.value),
    {
      watch: [query],
      default: (): UpstreamItem[] => [],
    },
  );

  const pending = computed(() => status.value === "pending");

  const createDialogOpen = ref(false);
  const creating = ref(false);
  const newItem = ref<UpstreamFormState>(getInitialUpstreamForm());

  const editDialogOpen = ref(false);
  const updating = ref(false);
  const editingId = ref<string | null>(null);
  const editItem = ref<UpstreamFormState>(getInitialUpstreamForm());

  const deleteDialogOpen = ref(false);
  const deleting = ref(false);
  const deletingId = ref<string | null>(null);
  const testingUpstreamId = ref<string | null>(null);

  const createItem = async () => {
    creating.value = true;
    try {
      await createUpstreamApi({
        name: newItem.value.name,
        url: newItem.value.url,
        scope: options.scope,
        userId: options.userId,
        tagId: options.tagId,
      });
      createDialogOpen.value = false;
      newItem.value = getInitialUpstreamForm();
      await refresh();
    } catch (error) {
      toast.add({
        title: t("common.toast.errorTitle"),
        description: getErrorMessage(error),
        color: "error",
      });
    } finally {
      creating.value = false;
    }
  };

  const openEditDialog = (item: UpstreamItem) => {
    editingId.value = item._id;
    editItem.value = {
      name: item.name || "",
      url: item.url || "",
    };
    editDialogOpen.value = true;
  };

  const closeEditDialog = () => {
    editDialogOpen.value = false;
    editingId.value = null;
    editItem.value = getInitialUpstreamForm();
  };

  const updateItem = async () => {
    if (!editingId.value) {
      return;
    }

    updating.value = true;
    try {
      await updateUpstreamApi(editingId.value, {
        name: editItem.value.name,
        url: editItem.value.url,
      });
      await refresh();
      closeEditDialog();
      toast.add({
        title: t("adminSources.toasts.upstreamUpdated"),
        color: "primary",
      });
    } catch (error) {
      toast.add({
        title: t("common.toast.errorTitle"),
        description: getErrorMessage(error),
        color: "error",
      });
    } finally {
      updating.value = false;
    }
  };

  const openDeleteDialog = (id: string) => {
    deletingId.value = id;
    deleteDialogOpen.value = true;
  };

  const deleteItem = async () => {
    if (!deletingId.value) {
      return;
    }

    deleting.value = true;
    try {
      await deleteUpstreamApi(deletingId.value);
      await refresh();
      deleteDialogOpen.value = false;
      deletingId.value = null;
    } catch (error) {
      toast.add({
        title: t("common.toast.errorTitle"),
        description: getErrorMessage(error),
        color: "error",
      });
    } finally {
      deleting.value = false;
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.add({ title: t("adminSources.toasts.urlCopied"), color: "primary" });
  };

  const copyError = async (error: string) => {
    await navigator.clipboard.writeText(error);
    toast.add({
      title: t("adminSources.toasts.errorCopied"),
      color: "primary",
    });
  };

  const formatDate = (value?: string | Date) => {
    if (!value) {
      return t("adminSources.date.never");
    }

    try {
      return new Date(value).toLocaleString(locale.value);
    } catch {
      return t("adminSources.date.unknown");
    }
  };

  const testFetch = async (upstreamId: string, url: string) => {
    testingUpstreamId.value = upstreamId;
    try {
      const response = await testUpstreamFetchApi({ url, upstreamId });
      if (response.success) {
        toast.add({
          title: t("adminSources.toasts.testFetchSuccessTitle"),
          description: t("adminSources.toasts.testFetchSuccessDescription", {
            size: String(response.size ?? 0),
            duration: String(response.duration),
          }),
          color: "success",
        });
      } else {
        toast.add({
          title: t("adminSources.toasts.testFetchFailedTitle"),
          description:
            response.error || t("adminSources.toasts.testFetchFailedFallback"),
          color: "error",
        });
      }
    } catch (error) {
      toast.add({
        title: t("common.toast.errorTitle"),
        description: getErrorMessage(error),
        color: "error",
      });
    } finally {
      testingUpstreamId.value = null;
      await refresh();
    }
  };

  return {
    upstreams,
    pending,
    refresh,
    createDialogOpen,
    creating,
    newItem,
    createItem,
    editDialogOpen,
    updating,
    editItem,
    openEditDialog,
    closeEditDialog,
    updateItem,
    deleteDialogOpen,
    deleting,
    openDeleteDialog,
    deleteItem,
    testFetch,
    testingUpstreamId,
    copyUrl,
    copyError,
    formatDate,
  };
};
