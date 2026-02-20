const en = {
  home: "Home",
  admin: "Admin",
  adminLogin: "Admin Login",
  adminSettings: "Global Settings",
  tags: "Tags",
  tagDetails: "Tag Details",
  users: "Users",
  userDetails: "User Details",
};

type PageMessages = typeof en;

const fa: PageMessages = {
  home: "خانه",
  admin: "مدیریت",
  adminLogin: "ورود ادمین",
  adminSettings: "تنظیمات سراسری",
  tags: "برچسب‌ها",
  tagDetails: "جزئیات برچسب",
  users: "کاربران",
  userDetails: "جزئیات کاربر",
};

const ru: PageMessages = {
  home: "Главная",
  admin: "Админ",
  adminLogin: "Вход администратора",
  adminSettings: "Глобальные настройки",
  tags: "Теги",
  tagDetails: "Детали тега",
  users: "Пользователи",
  userDetails: "Детали пользователя",
};

const zh: PageMessages = {
  home: "首页",
  admin: "管理",
  adminLogin: "管理员登录",
  adminSettings: "全局设置",
  tags: "标签",
  tagDetails: "标签详情",
  users: "用户",
  userDetails: "用户详情",
};

export const pageMessages = {
  en,
  fa,
  ru,
  zh,
};
