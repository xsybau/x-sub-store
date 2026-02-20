const en = {
  admin: {
    brandCaption: "Control",
    brandTitle: "X-SUB-Store",
    subtitle:
      "Manage subscriptions, users and upstream sources from one panel.",
    nav: {
      users: {
        label: "Users",
        description: "Create users, rotate tokens and inspect subscriptions",
      },
      tags: {
        label: "Tags",
        description:
          "Manage user tags, defaults and tag-level source targeting",
      },
      settings: {
        label: "Global Settings",
        description: "Manage global upstreams and shared static nodes",
      },
    },
    badge: "Admin Console",
    closeMenuAria: "Close menu",
    mobileMenu: {
      open: "Open Menu",
      close: "Close Menu",
    },
    languageLabel: "Language",
  },
};

type ShellMessages = typeof en;

const fa: ShellMessages = {
  admin: {
    brandCaption: "کنترل",
    brandTitle: "X-SUB-Store",
    subtitle: "اشتراک‌ها، کاربران و منابع بالادستی را از یک پنل مدیریت کنید.",
    nav: {
      users: {
        label: "کاربران",
        description: "ایجاد کاربران، چرخش توکن‌ها و بررسی اشتراک‌ها",
      },
      tags: {
        label: "برچسب‌ها",
        description: "مدیریت برچسب‌ها، پیش‌فرض‌ها و منبع‌دهی سطح برچسب",
      },
      settings: {
        label: "تنظیمات سراسری",
        description: "مدیریت منابع بالادستی و نودهای ثابت سراسری",
      },
    },
    badge: "کنسول مدیریت",
    closeMenuAria: "بستن منو",
    mobileMenu: {
      open: "باز کردن منو",
      close: "بستن منو",
    },
    languageLabel: "زبان",
  },
};

const ru: ShellMessages = {
  admin: {
    brandCaption: "Панель",
    brandTitle: "X-SUB-Store",
    subtitle:
      "Управляйте подписками, пользователями и upstream-источниками из одной панели.",
    nav: {
      users: {
        label: "Пользователи",
        description:
          "Создание пользователей, ротация токенов и просмотр подписок",
      },
      tags: {
        label: "Теги",
        description:
          "Управление тегами, значениями по умолчанию и источниками по тегам",
      },
      settings: {
        label: "Глобальные настройки",
        description:
          "Управление глобальными upstream-источниками и статическими нодами",
      },
    },
    badge: "Админ-консоль",
    closeMenuAria: "Закрыть меню",
    mobileMenu: {
      open: "Открыть меню",
      close: "Закрыть меню",
    },
    languageLabel: "Язык",
  },
};

const zh: ShellMessages = {
  admin: {
    brandCaption: "控制台",
    brandTitle: "X-SUB-Store",
    subtitle: "在一个面板中管理订阅、用户和上游来源。",
    nav: {
      users: {
        label: "用户",
        description: "创建用户、轮换令牌并查看订阅",
      },
      tags: {
        label: "标签",
        description: "管理用户标签、默认值和标签级来源",
      },
      settings: {
        label: "全局设置",
        description: "管理全局上游来源和共享静态节点",
      },
    },
    badge: "管理控制台",
    closeMenuAria: "关闭菜单",
    mobileMenu: {
      open: "打开菜单",
      close: "关闭菜单",
    },
    languageLabel: "语言",
  },
};

export const shellMessages = {
  en,
  fa,
  ru,
  zh,
};
