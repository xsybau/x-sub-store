import { useI18n } from "vue-i18n";
import type { AppLocale } from "~/i18n/config";
import {
  appLocales,
  getLocaleDirection,
  localeCookieName,
  normalizeLocale,
} from "~/i18n/config";

interface LocaleOption {
  value: AppLocale;
  label: string;
}

export const useAppLocale = () => {
  const { locale } = useI18n();

  const localeCookie = useCookie<AppLocale>(localeCookieName, {
    default: () => normalizeLocale(locale.value),
    sameSite: "lax",
  });

  const setLocale = (nextLocale: unknown) => {
    const normalized = normalizeLocale(nextLocale);
    if (locale.value !== normalized) {
      locale.value = normalized;
    }
    localeCookie.value = normalized;
  };

  watch(
    () => localeCookie.value,
    (nextLocale) => {
      setLocale(nextLocale);
    },
    { immediate: true },
  );

  watch(
    () => locale.value,
    (nextLocale) => {
      const normalized = normalizeLocale(nextLocale);
      if (localeCookie.value !== normalized) {
        localeCookie.value = normalized;
      }
      if (nextLocale !== normalized) {
        locale.value = normalized;
      }
    },
  );

  const normalizedLocale = computed<AppLocale>(() => {
    return normalizeLocale(locale.value);
  });

  const direction = computed(() => {
    return getLocaleDirection(normalizedLocale.value);
  });

  const isRtl = computed(() => {
    return direction.value === "rtl";
  });

  const localeOptions = computed<LocaleOption[]>(() => {
    return appLocales.map((item) => ({
      value: item.code,
      label: item.nativeLabel,
    }));
  });

  return {
    locale: normalizedLocale,
    setLocale,
    isRtl,
    direction,
    localeOptions,
  };
};
