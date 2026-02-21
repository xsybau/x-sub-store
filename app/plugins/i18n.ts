import { createI18n } from "vue-i18n";
import {
  defaultLocale,
  localeCookieName,
  normalizeLocale,
} from "~/i18n/config";
import { messages } from "~/i18n/messages";

export default defineNuxtPlugin((nuxtApp) => {
  const localeCookie = useCookie<string>(localeCookieName, {
    default: () => defaultLocale,
    sameSite: "lax",
  });

  const initialLocale = normalizeLocale(localeCookie.value);
  localeCookie.value = initialLocale;

  const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: defaultLocale,
    globalInjection: true,
    messages,
  });

  nuxtApp.vueApp.use(i18n);
});
