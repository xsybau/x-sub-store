const en = {
  upstreams: {
    title: "Upstreams",
    addButton: "Add Upstream",
    scope: {
      user: "User scope",
      tag: "Tag scope",
      global: "Global scope",
    },
    columns: {
      name: "Name",
      url: "URL",
      status: "Last Status",
      checked: "Last Check",
      actions: "Actions",
    },
    actions: {
      copyUrl: "Copy URL",
      testFetch: "Test Fetch",
      editUpstream: "Edit Upstream",
    },
    createModal: {
      title: "Add Upstream",
      description: "Create a new upstream source for subscriptions.",
      heading: "Add Upstream",
    },
    editModal: {
      title: "Edit Upstream",
      description: "Update upstream details for this source.",
      heading: "Edit Upstream",
    },
    deleteDialog: {
      title: "Delete Upstream",
      description: "This upstream will be removed from subscriptions.",
      confirmLabel: "Delete Upstream",
    },
    fields: {
      nameLabel: "Name",
      urlLabel: "URL",
      urlPlaceholder: "https://example.com/sub/...",
    },
  },
  staticNodes: {
    title: "Static Nodes",
    addButton: "Add Static Node",
    columns: {
      name: "Name",
      content: "Content",
      actions: "Actions",
    },
    actions: {
      editStaticNode: "Edit Static Node",
    },
    createModal: {
      title: "Add Static Node",
      description:
        "Add a manual node URI that will be included in generated subscriptions.",
      heading: "Add Static Node",
    },
    editModal: {
      title: "Edit Static Node",
      description: "Update label or content for this static node.",
      heading: "Edit Static Node",
    },
    deleteDialog: {
      title: "Delete Static Node",
      description: "This static node will be permanently removed.",
      confirmLabel: "Delete Node",
    },
    fields: {
      nameLabel: "Name",
      contentLabel: "Content (URI)",
      contentPlaceholder: "vmess://...",
    },
  },
  toasts: {
    upstreamUpdated: "Upstream updated",
    staticNodeUpdated: "Static node updated",
    urlCopied: "URL copied",
    errorCopied: "Error copied",
    testFetchSuccessTitle: "Success",
    testFetchSuccessDescription: "Fetched {size} bytes in {duration}ms",
    testFetchFailedTitle: "Failed",
    testFetchFailedFallback: "Unknown error",
  },
  date: {
    never: "Never",
    unknown: "Unknown",
  },
};

type AdminSourcesMessages = typeof en;

const fa: AdminSourcesMessages = {
  upstreams: {
    title: "منابع بالادستی",
    addButton: "افزودن منبع بالادستی",
    scope: {
      user: "محدوده کاربر",
      tag: "محدوده برچسب",
      global: "محدوده سراسری",
    },
    columns: {
      name: "نام",
      url: "URL",
      status: "آخرین وضعیت",
      checked: "آخرین بررسی",
      actions: "عملیات",
    },
    actions: {
      copyUrl: "کپی URL",
      testFetch: "تست واکشی",
      editUpstream: "ویرایش منبع بالادستی",
    },
    createModal: {
      title: "افزودن منبع بالادستی",
      description: "یک منبع بالادستی جدید برای اشتراک‌ها ایجاد کنید.",
      heading: "افزودن منبع بالادستی",
    },
    editModal: {
      title: "ویرایش منبع بالادستی",
      description: "جزئیات این منبع بالادستی را به‌روزرسانی کنید.",
      heading: "ویرایش منبع بالادستی",
    },
    deleteDialog: {
      title: "حذف منبع بالادستی",
      description: "این منبع بالادستی از اشتراک‌ها حذف می‌شود.",
      confirmLabel: "حذف منبع بالادستی",
    },
    fields: {
      nameLabel: "نام",
      urlLabel: "URL",
      urlPlaceholder: "https://example.com/sub/...",
    },
  },
  staticNodes: {
    title: "نودهای ثابت",
    addButton: "افزودن نود ثابت",
    columns: {
      name: "نام",
      content: "محتوا",
      actions: "عملیات",
    },
    actions: {
      editStaticNode: "ویرایش نود ثابت",
    },
    createModal: {
      title: "افزودن نود ثابت",
      description: "یک URI نود دستی اضافه کنید تا در خروجی اشتراک قرار بگیرد.",
      heading: "افزودن نود ثابت",
    },
    editModal: {
      title: "ویرایش نود ثابت",
      description: "برچسب یا محتوای این نود ثابت را به‌روزرسانی کنید.",
      heading: "ویرایش نود ثابت",
    },
    deleteDialog: {
      title: "حذف نود ثابت",
      description: "این نود ثابت به‌صورت دائمی حذف می‌شود.",
      confirmLabel: "حذف نود",
    },
    fields: {
      nameLabel: "نام",
      contentLabel: "محتوا (URI)",
      contentPlaceholder: "vmess://...",
    },
  },
  toasts: {
    upstreamUpdated: "منبع بالادستی به‌روزرسانی شد",
    staticNodeUpdated: "نود ثابت به‌روزرسانی شد",
    urlCopied: "URL کپی شد",
    errorCopied: "خطا کپی شد",
    testFetchSuccessTitle: "موفق",
    testFetchSuccessDescription:
      "{size} بایت در {duration} میلی‌ثانیه واکشی شد",
    testFetchFailedTitle: "ناموفق",
    testFetchFailedFallback: "خطای نامشخص",
  },
  date: {
    never: "هرگز",
    unknown: "نامشخص",
  },
};

const ru: AdminSourcesMessages = {
  upstreams: {
    title: "Upstream-источники",
    addButton: "Добавить upstream",
    scope: {
      user: "Уровень пользователя",
      tag: "Уровень тега",
      global: "Глобальный уровень",
    },
    columns: {
      name: "Название",
      url: "URL",
      status: "Последний статус",
      checked: "Последняя проверка",
      actions: "Действия",
    },
    actions: {
      copyUrl: "Скопировать URL",
      testFetch: "Проверить загрузку",
      editUpstream: "Редактировать upstream",
    },
    createModal: {
      title: "Добавить upstream",
      description: "Создайте новый upstream-источник для подписок.",
      heading: "Добавить upstream",
    },
    editModal: {
      title: "Редактировать upstream",
      description: "Обновите параметры этого upstream-источника.",
      heading: "Редактировать upstream",
    },
    deleteDialog: {
      title: "Удалить upstream",
      description: "Этот upstream-источник будет удален из подписок.",
      confirmLabel: "Удалить upstream",
    },
    fields: {
      nameLabel: "Название",
      urlLabel: "URL",
      urlPlaceholder: "https://example.com/sub/...",
    },
  },
  staticNodes: {
    title: "Статические ноды",
    addButton: "Добавить статическую ноду",
    columns: {
      name: "Название",
      content: "Содержимое",
      actions: "Действия",
    },
    actions: {
      editStaticNode: "Редактировать статическую ноду",
    },
    createModal: {
      title: "Добавить статическую ноду",
      description:
        "Добавьте URI ноды вручную, чтобы включить его в сгенерированную подписку.",
      heading: "Добавить статическую ноду",
    },
    editModal: {
      title: "Редактировать статическую ноду",
      description: "Обновите метку или содержимое статической ноды.",
      heading: "Редактировать статическую ноду",
    },
    deleteDialog: {
      title: "Удалить статическую ноду",
      description: "Эта статическая нода будет удалена навсегда.",
      confirmLabel: "Удалить ноду",
    },
    fields: {
      nameLabel: "Название",
      contentLabel: "Содержимое (URI)",
      contentPlaceholder: "vmess://...",
    },
  },
  toasts: {
    upstreamUpdated: "Upstream обновлен",
    staticNodeUpdated: "Статическая нода обновлена",
    urlCopied: "URL скопирован",
    errorCopied: "Ошибка скопирована",
    testFetchSuccessTitle: "Успешно",
    testFetchSuccessDescription: "Получено {size} байт за {duration}мс",
    testFetchFailedTitle: "Неудачно",
    testFetchFailedFallback: "Неизвестная ошибка",
  },
  date: {
    never: "Никогда",
    unknown: "Неизвестно",
  },
};

const zh: AdminSourcesMessages = {
  upstreams: {
    title: "上游来源",
    addButton: "新增上游",
    scope: {
      user: "用户范围",
      tag: "标签范围",
      global: "全局范围",
    },
    columns: {
      name: "名称",
      url: "URL",
      status: "最近状态",
      checked: "最近检查",
      actions: "操作",
    },
    actions: {
      copyUrl: "复制 URL",
      testFetch: "测试抓取",
      editUpstream: "编辑上游",
    },
    createModal: {
      title: "新增上游",
      description: "创建一个新的上游来源用于订阅聚合。",
      heading: "新增上游",
    },
    editModal: {
      title: "编辑上游",
      description: "更新该上游来源的详细信息。",
      heading: "编辑上游",
    },
    deleteDialog: {
      title: "删除上游",
      description: "该上游来源将从订阅中移除。",
      confirmLabel: "删除上游",
    },
    fields: {
      nameLabel: "名称",
      urlLabel: "URL",
      urlPlaceholder: "https://example.com/sub/...",
    },
  },
  staticNodes: {
    title: "静态节点",
    addButton: "新增静态节点",
    columns: {
      name: "名称",
      content: "内容",
      actions: "操作",
    },
    actions: {
      editStaticNode: "编辑静态节点",
    },
    createModal: {
      title: "新增静态节点",
      description: "添加一个手动节点 URI，并包含到生成的订阅中。",
      heading: "新增静态节点",
    },
    editModal: {
      title: "编辑静态节点",
      description: "更新该静态节点的标签或内容。",
      heading: "编辑静态节点",
    },
    deleteDialog: {
      title: "删除静态节点",
      description: "该静态节点将被永久删除。",
      confirmLabel: "删除节点",
    },
    fields: {
      nameLabel: "名称",
      contentLabel: "内容 (URI)",
      contentPlaceholder: "vmess://...",
    },
  },
  toasts: {
    upstreamUpdated: "上游已更新",
    staticNodeUpdated: "静态节点已更新",
    urlCopied: "URL 已复制",
    errorCopied: "错误信息已复制",
    testFetchSuccessTitle: "成功",
    testFetchSuccessDescription: "已在 {duration}ms 内抓取 {size} 字节",
    testFetchFailedTitle: "失败",
    testFetchFailedFallback: "未知错误",
  },
  date: {
    never: "从不",
    unknown: "未知",
  },
};

export const adminSourcesMessages = {
  en,
  fa,
  ru,
  zh,
};
