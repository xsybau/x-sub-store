export type AppLocale = "en" | "fa" | "ru" | "zh";
export type LocaleDirection = "ltr" | "rtl";

interface LocaleMeta {
  code: AppLocale;
  label: string;
  nativeLabel: string;
  direction: LocaleDirection;
}

export const defaultLocale: AppLocale = "en";
export const localeCookieName = "locale";

export const localeMeta: Record<AppLocale, LocaleMeta> = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
  },
  fa: {
    code: "fa",
    label: "Persian",
    nativeLabel: "فارسی",
    direction: "rtl",
  },
  ru: {
    code: "ru",
    label: "Russian",
    nativeLabel: "Русский",
    direction: "ltr",
  },
  zh: {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    direction: "ltr",
  },
};

export const appLocales = Object.values(localeMeta);

const supportedLocaleSet = new Set<AppLocale>(
  Object.keys(localeMeta) as AppLocale[],
);

export const isAppLocale = (value: unknown): value is AppLocale => {
  if (typeof value !== "string") {
    return false;
  }

  return supportedLocaleSet.has(value as AppLocale);
};

export const normalizeLocale = (value: unknown): AppLocale => {
  if (isAppLocale(value)) {
    return value;
  }

  return defaultLocale;
};

export const getLocaleDirection = (locale: AppLocale): LocaleDirection => {
  return localeMeta[locale].direction;
};
