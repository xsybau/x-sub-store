export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path.startsWith('/admin')) {
        const { user, fetchUser } = useAuth();

        if (!user.value) {
            await fetchUser();
        }

        if (!user.value && to.path !== '/admin/login') {
            return navigateTo('/admin/login');
        }

        if (user.value && to.path === '/admin/login') {
            return navigateTo('/admin/users');
        }
    }
});
