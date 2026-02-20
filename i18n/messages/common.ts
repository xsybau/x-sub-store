const en = {
  actions: {
    confirm: "Confirm",
    cancel: "Cancel",
    create: "Create",
    save: "Save",
    saveChanges: "Save Changes",
    delete: "Delete",
    copy: "Copy",
    add: "Add",
    manage: "Manage",
    logout: "Logout",
  },
  status: {
    active: "Active",
    inactive: "Inactive",
    default: "Default",
    optional: "Optional",
    healthy: "Healthy",
    issue: "Issue",
  },
  toast: {
    errorTitle: "Error",
    successTitle: "Success",
  },
  errors: {
    unexpected: "Unexpected error",
    unknown: "Unknown error",
  },
  labels: {
    unknownTag: "Unknown tag",
    noValue: "-",
    never: "Never",
    unknown: "Unknown",
  },
  language: {
    label: "Language",
    en: "English",
    fa: "فارسی",
    ru: "Русский",
    zh: "中文",
  },
};

type CommonMessages = typeof en;

const fa: CommonMessages = {
  actions: {
    confirm: "تایید",
    cancel: "لغو",
    create: "ایجاد",
    save: "ذخیره",
    saveChanges: "ذخیره تغییرات",
    delete: "حذف",
    copy: "کپی",
    add: "افزودن",
    manage: "مدیریت",
    logout: "خروج",
  },
  status: {
    active: "فعال",
    inactive: "غیرفعال",
    default: "پیش‌فرض",
    optional: "اختیاری",
    healthy: "سالم",
    issue: "مشکل",
  },
  toast: {
    errorTitle: "خطا",
    successTitle: "موفق",
  },
  errors: {
    unexpected: "خطای غیرمنتظره",
    unknown: "خطای نامشخص",
  },
  labels: {
    unknownTag: "برچسب نامشخص",
    noValue: "-",
    never: "هرگز",
    unknown: "نامشخص",
  },
  language: {
    label: "زبان",
    en: "English",
    fa: "فارسی",
    ru: "Русский",
    zh: "中文",
  },
};

const ru: CommonMessages = {
  actions: {
    confirm: "Подтвердить",
    cancel: "Отмена",
    create: "Создать",
    save: "Сохранить",
    saveChanges: "Сохранить изменения",
    delete: "Удалить",
    copy: "Копировать",
    add: "Добавить",
    manage: "Управлять",
    logout: "Выйти",
  },
  status: {
    active: "Активен",
    inactive: "Неактивен",
    default: "По умолчанию",
    optional: "Необязательный",
    healthy: "Исправно",
    issue: "Проблема",
  },
  toast: {
    errorTitle: "Ошибка",
    successTitle: "Успешно",
  },
  errors: {
    unexpected: "Непредвиденная ошибка",
    unknown: "Неизвестная ошибка",
  },
  labels: {
    unknownTag: "Неизвестный тег",
    noValue: "-",
    never: "Никогда",
    unknown: "Неизвестно",
  },
  language: {
    label: "Язык",
    en: "English",
    fa: "فارسی",
    ru: "Русский",
    zh: "中文",
  },
};

const zh: CommonMessages = {
  actions: {
    confirm: "确认",
    cancel: "取消",
    create: "创建",
    save: "保存",
    saveChanges: "保存更改",
    delete: "删除",
    copy: "复制",
    add: "新增",
    manage: "管理",
    logout: "退出登录",
  },
  status: {
    active: "启用",
    inactive: "停用",
    default: "默认",
    optional: "可选",
    healthy: "正常",
    issue: "异常",
  },
  toast: {
    errorTitle: "错误",
    successTitle: "成功",
  },
  errors: {
    unexpected: "发生意外错误",
    unknown: "未知错误",
  },
  labels: {
    unknownTag: "未知标签",
    noValue: "-",
    never: "从不",
    unknown: "未知",
  },
  language: {
    label: "语言",
    en: "English",
    fa: "فارسی",
    ru: "Русский",
    zh: "中文",
  },
};

export const commonMessages = {
  en,
  fa,
  ru,
  zh,
};
