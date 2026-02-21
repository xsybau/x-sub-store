<template>
  <div
    class="min-h-screen bg-linear-to-br from-violet-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950"
  >
    <div class="flex min-h-screen lg:flex-row">
      <AdminSidebar
        :mobile-menu-open="mobileMenuOpen"
        :is-rtl="isRtl"
        :links="links"
        :current-path="route.path"
        :locale="locale"
        :locale-options="localeOptions"
        @close-mobile-menu="mobileMenuOpen = false"
        @update-locale="handleLocaleUpdate"
        @logout="logout"
      />

      <main class="flex-1 min-w-0 overflow-x-hidden">
        <div class="mx-auto max-w-7xl p-4 sm:p-8">
          <slot />
        </div>
      </main>
    </div>

    <AdminMobileMenuToggle
      :open="mobileMenuOpen"
      @toggle="mobileMenuOpen = !mobileMenuOpen"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import AdminMobileMenuToggle from "~/app/components/admin/AdminMobileMenuToggle.vue";
import AdminSidebar from "~/app/components/admin/AdminSidebar.vue";

interface AdminNavLink {
  label: string;
  to: string;
  icon: string;
  description: string;
}

const route = useRoute();
const { t } = useI18n();
const { logout } = useAuth();
const mobileMenuOpen = ref(false);
const { locale, setLocale, isRtl, localeOptions } = useAppLocale();

const links = computed<AdminNavLink[]>(() => [
  {
    label: t("shell.admin.nav.users.label"),
    to: "/admin/users",
    icon: "i-heroicons-users",
    description: t("shell.admin.nav.users.description"),
  },
  {
    label: t("shell.admin.nav.tags.label"),
    to: "/admin/tags",
    icon: "i-heroicons-tag",
    description: t("shell.admin.nav.tags.description"),
  },
  {
    label: t("shell.admin.nav.settings.label"),
    to: "/admin/settings",
    icon: "i-heroicons-cog-6-tooth",
    description: t("shell.admin.nav.settings.description"),
  },
]);

const handleLocaleUpdate = (value: unknown) => {
  setLocale(value);
};

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  },
);
</script>
