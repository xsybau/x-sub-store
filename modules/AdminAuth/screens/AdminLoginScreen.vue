<template>
  <div
    class="relative min-h-screen overflow-hidden bg-linear-to-br from-violet-100 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950"
  >
    <div
      class="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl"
    />

    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-8"
    >
      <AdminLoginCard
        :locale="locale"
        :locale-options="localeOptions"
        :loading="loading"
        @update-locale="setLocale"
        @submit="handleLogin"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { FetchError } from "ofetch";
import AdminLoginCard from "~/modules/AdminAuth/components/AdminLoginCard.vue";
import { useAdminAuth } from "~/modules/AdminAuth/composables/useAdminAuth";

interface LoginForm {
  email: string;
  password: string;
}

const { t } = useI18n();
const { locale, setLocale, localeOptions } = useAppLocale();

const loading = ref(false);
const toast = useToast();
const { login } = useAdminAuth();

const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || !error) {
    return t("adminAuth.login.failed");
  }

  const candidate = error as FetchError;
  const message =
    candidate.data && typeof candidate.data === "object"
      ? (candidate.data as { message?: string }).message
      : undefined;

  return message || candidate.message || t("adminAuth.login.failed");
};

const handleLogin = async (form: LoginForm) => {
  loading.value = true;
  try {
    await login(form);
    await navigateTo("/admin/users");
  } catch (error) {
    toast.add({
      title: t("common.toast.errorTitle"),
      description: getErrorMessage(error),
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
