import type { FetchError } from "ofetch";
import type {
  SourceScope,
  StaticNodeItem,
} from "~/modules/AdminSources/types/sources";
import {
  createStaticNodeApi,
  deleteStaticNodeApi,
  listStaticNodesApi,
  updateStaticNodeApi,
} from "~/modules/AdminSources/utils/sourcesApi";

interface UseStaticNodeManagerOptions {
  scope: SourceScope;
  userId?: string;
}

interface StaticNodeFormState {
  name: string;
  content: string;
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || !error) {
    return "Unknown error";
  }

  const candidate = error as FetchError;
  const message =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as { message?: string }).message
      : undefined;

  if (message) {
    return message;
  }

  return candidate.message || "Unknown error";
};

const getInitialStaticNodeForm = (): StaticNodeFormState => ({
  name: "",
  content: "",
});

export const useStaticNodeManager = (options: UseStaticNodeManagerOptions) => {
  const toast = useToast();

  const query = computed(() => ({
    scope: options.scope,
    userId: options.userId,
  }));

  const {
    data: nodes,
    status,
    refresh,
  } = useAsyncData<StaticNodeItem[]>(
    () =>
      `admin-static-nodes-${query.value.scope}-${query.value.userId || "none"}`,
    () => listStaticNodesApi(query.value),
    {
      watch: [query],
      default: (): StaticNodeItem[] => [],
    },
  );

  const pending = computed(() => status.value === "pending");

  const createDialogOpen = ref(false);
  const creating = ref(false);
  const newItem = ref<StaticNodeFormState>(getInitialStaticNodeForm());

  const editDialogOpen = ref(false);
  const updating = ref(false);
  const editingId = ref<string | null>(null);
  const editItem = ref<StaticNodeFormState>(getInitialStaticNodeForm());

  const deleteDialogOpen = ref(false);
  const deleting = ref(false);
  const deletingId = ref<string | null>(null);

  const createItem = async () => {
    creating.value = true;
    try {
      await createStaticNodeApi({
        name: newItem.value.name,
        content: newItem.value.content,
        scope: options.scope,
        userId: options.userId,
      });
      createDialogOpen.value = false;
      newItem.value = getInitialStaticNodeForm();
      await refresh();
    } catch (error) {
      toast.add({
        title: "Error",
        description: getErrorMessage(error),
        color: "error",
      });
    } finally {
      creating.value = false;
    }
  };

  const openEditDialog = (item: StaticNodeItem) => {
    editingId.value = item._id;
    editItem.value = {
      name: item.name || "",
      content: item.content || "",
    };
    editDialogOpen.value = true;
  };

  const closeEditDialog = () => {
    editDialogOpen.value = false;
    editingId.value = null;
    editItem.value = getInitialStaticNodeForm();
  };

  const updateItem = async () => {
    if (!editingId.value) {
      return;
    }

    updating.value = true;
    try {
      await updateStaticNodeApi(editingId.value, {
        name: editItem.value.name,
        content: editItem.value.content,
      });
      await refresh();
      closeEditDialog();
      toast.add({ title: "Static node updated", color: "primary" });
    } catch (error) {
      toast.add({
        title: "Error",
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
      await deleteStaticNodeApi(deletingId.value);
      await refresh();
      deleteDialogOpen.value = false;
      deletingId.value = null;
    } catch (error) {
      toast.add({
        title: "Error",
        description: getErrorMessage(error),
        color: "error",
      });
    } finally {
      deleting.value = false;
    }
  };

  return {
    nodes,
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
  };
};
