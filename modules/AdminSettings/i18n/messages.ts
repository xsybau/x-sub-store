const en = {
  title: "Global Settings",
  description: "Manage upstream and static sources shared across all users.",
  globalUpstreams: "Global Upstreams",
  globalStaticNodes: "Global Static Nodes",
};

type AdminSettingsMessages = typeof en;

const fa: AdminSettingsMessages = {
  title: "تنظیمات سراسری",
  description: "مدیریت منابع بالادستی و نودهای ثابت مشترک بین همه کاربران.",
  globalUpstreams: "منابع بالادستی سراسری",
  globalStaticNodes: "نودهای ثابت سراسری",
};

const ru: AdminSettingsMessages = {
  title: "Глобальные настройки",
  description:
    "Управление upstream-источниками и статическими нодами для всех пользователей.",
  globalUpstreams: "Глобальные upstream-источники",
  globalStaticNodes: "Глобальные статические ноды",
};

const zh: AdminSettingsMessages = {
  title: "全局设置",
  description: "管理所有用户共享的上游来源和静态节点。",
  globalUpstreams: "全局上游来源",
  globalStaticNodes: "全局静态节点",
};

export const adminSettingsMessages = {
  en,
  fa,
  ru,
  zh,
};
