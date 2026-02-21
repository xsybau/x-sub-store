<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();

definePageMeta({
  middleware: [
    function () {
      return navigateTo("/admin/users");
    },
  ],
});

useHead(() => ({
  title: t("pages.admin"),
}));
</script>
