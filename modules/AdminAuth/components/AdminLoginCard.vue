<template>
  <UCard
    class="w-full max-w-md border border-primary/20 bg-white/90 shadow-2xl shadow-primary/10 backdrop-blur dark:bg-gray-900/90"
  >
    <template #header>
      <div class="space-y-3">
        <div class="flex justify-end">
          <UInputMenu
            :model-value="locale"
            :items="localeOptions"
            label-key="label"
            value-key="value"
            class="w-32"
            @update:model-value="emit('updateLocale', $event)"
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

    <form class="space-y-5" @submit.prevent="submit">
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

      <UFormField :label="t('adminAuth.login.passwordLabel')" class="w-full">
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
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { AppLocale } from "~/i18n/config";

interface LocaleOption {
  value: AppLocale;
  label: string;
}

interface LoginForm {
  email: string;
  password: string;
}

defineProps<{
  locale: AppLocale;
  localeOptions: LocaleOption[];
  loading: boolean;
}>();

const emit = defineEmits<{
  updateLocale: [value: unknown];
  submit: [form: LoginForm];
}>();

const { t } = useI18n();

const form = reactive<LoginForm>({
  email: "",
  password: "",
});

const submit = () => {
  emit("submit", {
    email: form.email,
    password: form.password,
  });
};
</script>
