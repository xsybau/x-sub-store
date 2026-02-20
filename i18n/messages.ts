import type { AppLocale } from "./config";
import { commonMessages } from "./messages/common";
import { pageMessages } from "./messages/pages";
import { shellMessages } from "./messages/shell";
import { adminAuthMessages } from "../modules/AdminAuth/i18n/messages";
import { adminSettingsMessages } from "../modules/AdminSettings/i18n/messages";
import { adminSourcesMessages } from "../modules/AdminSources/i18n/messages";
import { adminUsersMessages } from "../modules/AdminUsers/i18n/messages";

export const messages = {
  en: {
    common: commonMessages.en,
    shell: shellMessages.en,
    pages: pageMessages.en,
    adminAuth: adminAuthMessages.en,
    adminSettings: adminSettingsMessages.en,
    adminSources: adminSourcesMessages.en,
    adminUsers: adminUsersMessages.en,
  },
  fa: {
    common: commonMessages.fa,
    shell: shellMessages.fa,
    pages: pageMessages.fa,
    adminAuth: adminAuthMessages.fa,
    adminSettings: adminSettingsMessages.fa,
    adminSources: adminSourcesMessages.fa,
    adminUsers: adminUsersMessages.fa,
  },
  ru: {
    common: commonMessages.ru,
    shell: shellMessages.ru,
    pages: pageMessages.ru,
    adminAuth: adminAuthMessages.ru,
    adminSettings: adminSettingsMessages.ru,
    adminSources: adminSourcesMessages.ru,
    adminUsers: adminUsersMessages.ru,
  },
  zh: {
    common: commonMessages.zh,
    shell: shellMessages.zh,
    pages: pageMessages.zh,
    adminAuth: adminAuthMessages.zh,
    adminSettings: adminSettingsMessages.zh,
    adminSources: adminSourcesMessages.zh,
    adminUsers: adminUsersMessages.zh,
  },
} satisfies Record<AppLocale, Record<string, unknown>>;

export type AppMessages = typeof messages.en;
