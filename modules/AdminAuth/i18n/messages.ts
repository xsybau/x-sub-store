const en = {
  login: {
    welcomeBack: "Welcome Back",
    subtitle: "Sign in to continue to the admin dashboard.",
    emailLabel: "Email",
    passwordLabel: "Password",
    signIn: "Sign In",
    failed: "Login failed",
  },
};

type AdminAuthMessages = typeof en;

const fa: AdminAuthMessages = {
  login: {
    welcomeBack: "خوش آمدید",
    subtitle: "برای ادامه به داشبورد مدیریت وارد شوید.",
    emailLabel: "ایمیل",
    passwordLabel: "رمز عبور",
    signIn: "ورود",
    failed: "ورود ناموفق بود",
  },
};

const ru: AdminAuthMessages = {
  login: {
    welcomeBack: "С возвращением",
    subtitle: "Войдите, чтобы продолжить в административную панель.",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    signIn: "Войти",
    failed: "Ошибка входа",
  },
};

const zh: AdminAuthMessages = {
  login: {
    welcomeBack: "欢迎回来",
    subtitle: "登录后继续访问管理面板。",
    emailLabel: "邮箱",
    passwordLabel: "密码",
    signIn: "登录",
    failed: "登录失败",
  },
};

export const adminAuthMessages = {
  en,
  fa,
  ru,
  zh,
};
