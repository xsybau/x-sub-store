<template>
  <div
    v-if="mobileMenuOpen"
    class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
    @click="emit('closeMobileMenu')"
  />

  <aside
    class="fixed inset-y-0 z-50 h-screen max-h-screen w-[84vw] max-w-sm overflow-hidden border-default/70 bg-white/90 backdrop-blur-md transition-transform duration-300 dark:bg-gray-900/90 flex flex-col lg:sticky lg:top-0 lg:z-10 lg:w-80 lg:max-w-none lg:translate-x-0"
    :class="[asideSideClass, mobileMenuAsideClass]"
  >
    <div class="p-6 border-b border-default/70">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-inverted shadow-sm"
          >
            <UIcon name="i-heroicons-command-line" class="size-5" />
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-primary/80">
              {{ t("shell.admin.brandCaption") }}
            </p>
            <h1 class="text-xl font-semibold text-highlighted">
              {{ t("shell.admin.brandTitle") }}
            </h1>
          </div>
        </div>
        <UButton
          class="lg:hidden"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-x-mark"
          :aria-label="t('shell.admin.closeMenuAria')"
          @click="emit('closeMobileMenu')"
        />
      </div>
      <p class="mt-3 text-xs text-muted">
        {{ t("shell.admin.subtitle") }}
      </p>
    </div>

    <nav class="p-4 flex-1 space-y-2 overflow-y-auto">
      <NuxtLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="group flex items-start gap-3 rounded-2xl border px-3 py-3 transition"
        :class="
          isActive(item.to)
            ? 'border-primary/40 bg-primary/10 shadow-sm'
            : 'border-default/70 bg-default/40 hover:border-primary/40 hover:bg-primary/5'
        "
        @click="emit('closeMobileMenu')"
      >
        <div
          class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-default/70 bg-white/75 dark:bg-gray-900/70"
          :class="
            isActive(item.to)
              ? 'text-primary'
              : 'text-muted group-hover:text-primary'
          "
        >
          <UIcon :name="item.icon" class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold leading-tight text-highlighted">
            {{ item.label }}
          </p>
          <p class="mt-1 truncate text-xs text-muted">
            {{ item.description }}
          </p>
        </div>
      </NuxtLink>
    </nav>

    <div class="p-4 border-t border-default/70">
      <div
        class="rounded-2xl border border-default/70 bg-default/40 p-3 space-y-3"
      >
        <UFormField :label="t('shell.admin.languageLabel')" class="w-full">
          <UInputMenu
            :model-value="locale"
            :items="localeOptions"
            label-key="label"
            value-key="value"
            class="w-full"
            @update:model-value="emit('updateLocale', $event)"
          />
        </UFormField>
        <UBadge color="primary" variant="subtle">
          {{ t("shell.admin.badge") }}
        </UBadge>
        <UButton variant="soft" color="error" block @click="emit('logout')">
          {{ t("common.actions.logout") }}
        </UButton>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { AppLocale } from "~/i18n/config";

interface SidebarLink {
  label: string;
  to: string;
  icon: string;
  description: string;
}

interface LocaleOption {
  value: AppLocale;
  label: string;
}

const emit = defineEmits<{
  closeMobileMenu: [];
  updateLocale: [value: unknown];
  logout: [];
}>();

const props = defineProps<{
  mobileMenuOpen: boolean;
  isRtl: boolean;
  links: SidebarLink[];
  currentPath: string;
  locale: AppLocale;
  localeOptions: LocaleOption[];
}>();

const { t } = useI18n();

const asideSideClass = computed(() => {
  return props.isRtl
    ? "right-0 border-l lg:right-auto"
    : "left-0 border-r lg:left-auto";
});

const mobileMenuAsideClass = computed(() => {
  if (props.mobileMenuOpen) {
    return "translate-x-0";
  }

  return props.isRtl
    ? "translate-x-full lg:translate-x-0"
    : "-translate-x-full lg:translate-x-0";
});

const isActive = (to: string) => {
  return props.currentPath === to || props.currentPath.startsWith(`${to}/`);
};
</script>
