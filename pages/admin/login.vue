<template>
  <div
    class="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-100 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950"
  >
    <div class="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
    <div class="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-8">
      <UCard class="w-full max-w-md border border-primary/20 bg-white/90 shadow-2xl shadow-primary/10 backdrop-blur dark:bg-gray-900/90">
        <template #header>
          <div class="space-y-3">
            <div class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-inverted">
              <UIcon name="i-heroicons-shield-check" class="size-5" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-highlighted">Welcome Back</h3>
              <p class="mt-1 text-sm text-muted">Sign in to continue to the admin dashboard.</p>
            </div>
          </div>
        </template>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <UFormField label="Email" class="w-full">
            <UInput v-model="form.email" type="email" required autocomplete="username" size="xl" class="w-full" />
          </UFormField>
          <UFormField label="Password" class="w-full">
            <UInput
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UButton type="submit" size="xl" class="w-full justify-center" :loading="loading">Sign In</UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const form = ref({ email: '', password: '' });
const loading = ref(false);
const { login } = useAuth();
const toast = useToast();

const handleLogin = async () => {
  loading.value = true;
  try {
    await login(form.value);
    navigateTo('/admin/users');
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message || 'Login failed', color: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>
