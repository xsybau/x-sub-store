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
      <UCard
        class="w-full max-w-md border border-primary/20 bg-white/90 shadow-2xl shadow-primary/10 backdrop-blur dark:bg-gray-900/90"
      >
        <template #header>
          <div class="space-y-3">
            <div class="flex justify-end">
              <UInputMenu
                v-model="selectedLocale"
                :items="localeOptions"
                label-key="label"
                value-key="value"
                class="w-32"
              />
            </div>

            <div
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-inverted"
            >
              <UIcon name="i-heroicons-shield-check" class="size-5" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-highlighted">
                {{ t("adminAuth.login.welcomeBack") }}
              </h3>
              <p class="mt-1 text-sm text-muted">
                {{ t("adminAuth.login.subtitle") }}
              </p>
            </div>
          </div>
        </template>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <UFormField :label="t('adminAuth.login.emailLabel')" class="w-full">
            <UInput
              v-model="form.email"
              type="email"
              required
              autocomplete="username"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('adminAuth.login.passwordLabel')"
            class="w-full"
          >
            <UInput
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            size="xl"
            class="w-full justify-center"
            :loading="loading"
          >
            {{ t("adminAuth.login.signIn") }}
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { FetchError } from "ofetch";
import { useAdminAuth } from "~/modules/AdminAuth/composables/useAdminAuth";

const { t } = useI18n();
const { locale, setLocale, localeOptions } = useAppLocale();

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: unknown) => {
    setLocale(value);
  },
});

const form = ref({ email: "", password: "" });
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

const handleLogin = async () => {
  loading.value = true;
  try {
    await login(form.value);
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
