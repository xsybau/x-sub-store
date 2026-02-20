<template>
  <div
    class="min-h-screen bg-linear-to-br from-violet-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950"
  >
    <div class="flex min-h-screen">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
        @click="mobileMenuOpen = false"
      />

      <aside
        class="fixed inset-y-0 left-0 z-50 w-[84vw] max-w-sm border-r border-default/70 bg-white/90 backdrop-blur-md dark:bg-gray-900/90 flex flex-col transition-transform duration-300 lg:static lg:z-10 lg:w-80 lg:max-w-none lg:translate-x-0"
        :class="
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        "
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
                <p
                  class="text-[11px] uppercase tracking-[0.2em] text-primary/80"
                >
                  Control
                </p>
                <h1 class="text-xl font-semibold text-highlighted">
                  V2Ray Hub
                </h1>
              </div>
            </div>
            <UButton
              class="lg:hidden"
              variant="ghost"
              color="neutral"
              icon="i-heroicons-x-mark"
              aria-label="Close menu"
              @click="mobileMenuOpen = false"
            />
          </div>
          <p class="mt-3 text-xs text-muted">
            Manage subscriptions, users and upstream sources from one panel.
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
            @click="mobileMenuOpen = false"
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
            <UBadge color="primary" variant="subtle">Admin Console</UBadge>
            <UButton variant="soft" color="error" block @click="logout"
              >Logout</UButton
            >
          </div>
        </div>
      </aside>

      <main class="flex-1 min-w-0 overflow-x-hidden">
        <div class="mx-auto max-w-7xl p-4 sm:p-8">
          <slot />
        </div>
      </main>
    </div>

    <div
      class="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:hidden"
    >
      <UButton
        color="primary"
        variant="solid"
        class="rounded-full px-5 py-2 shadow-lg shadow-primary/20"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <UIcon
          :name="mobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
          class="size-4"
        />
        <span>{{ mobileMenuOpen ? "Close Menu" : "Open Menu" }}</span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { logout } = useAuth();
const mobileMenuOpen = ref(false);

const links = [
  {
    label: "Users",
    to: "/admin/users",
    icon: "i-heroicons-users",
    description: "Create users, rotate tokens and inspect subscriptions",
  },
  {
    label: "Tags",
    to: "/admin/tags",
    icon: "i-heroicons-tag",
    description: "Manage user tags, defaults and tag-level source targeting",
  },
  {
    label: "Global Settings",
    to: "/admin/settings",
    icon: "i-heroicons-cog-6-tooth",
    description: "Manage global upstreams and shared static nodes",
  },
];

const isActive = (to: string) =>
  route.path === to || route.path.startsWith(`${to}/`);

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  },
);
</script>
