const en = {
  usersList: {
    title: "Users",
    addUserButton: "Add User",
    columns: {
      name: "Name",
      email: "Email",
      description: "Description",
      tags: "Tags",
      status: "Status",
      actions: "Actions",
    },
    actions: {
      copySubscriptionUrl: "Copy Subscription URL",
      previewSubscription: "Preview Subscription",
      deactivateUser: "Deactivate User",
      activateUser: "Activate User",
    },
    createModal: {
      title: "Create User",
      description: "Add a new user with optional email and admin-only notes.",
      heading: "Create User",
      labelField: "Label",
      emailField: "Email",
      descriptionField: "Description (Admin Only)",
      descriptionPlaceholder: "Internal note for this user",
      tagsField: "Tags",
      tagsPlaceholder: "Select tags",
      tagsHint: "Default tags are added automatically for new users.",
    },
    previewModal: {
      title: "Preview: {label}",
      description: "Quick subscription preview directly from the users table.",
      userFallback: "User",
      uniqueNodes: "Unique Nodes",
      rawNodes: "Raw Nodes",
      upstreams: "Upstreams",
      firstNodes: "First Nodes",
      openFullPage: "Open Full Page",
    },
    deleteDialog: {
      title: "Delete User",
      description:
        "This will permanently delete the user and all related data.",
      confirmLabel: "Delete User",
    },
    toasts: {
      userCreated: "User created",
      tokenGenerated: "Token generated successfully",
      subscriptionUrlCopied: "Subscription URL copied",
      copyFailed: "Copy failed",
      previewFailed: "Preview Failed",
      statusUpdateFailed: "Status update failed",
      userActivated: "User activated",
      userDeactivated: "User deactivated",
    },
  },
  userDetails: {
    previewSubscriptionButton: "Preview Subscription",
    deactivateButton: "Deactivate",
    activateButton: "Activate",
    deleteUserButton: "Delete User",
    cards: {
      adminNotes: "Admin Notes",
      userTags: "User Tags",
      subscriptionUrl: "Subscription URL",
      userUpstreams: "User Upstreams",
      userStaticNodes: "User Static Nodes",
    },
    fields: {
      descriptionAdminOnly: "Description (Admin Only)",
      descriptionPlaceholder: "Internal notes for this user",
      assignedTags: "Assigned Tags",
      userTagsPlaceholder: "Select user tags",
      tokenLabel: "Token: {token}",
    },
    notes: {
      adminOnlyVisibility:
        "This note is visible only in admin user management screens.",
      tagsSaving: "Saving...",
      tagsAutosaveFailed: "Autosave failed. Edit tags again to retry.",
      tagsPendingSave: "Pending save...",
      tagsAutoSaved: "Changes save automatically.",
    },
    buttons: {
      saveDescription: "Save Description",
      copy: "Copy",
      rotateToken: "Rotate Token",
      copyNodes: "Copy",
    },
    previewModal: {
      title: "Subscription Preview",
      description: "Inspect generated nodes and upstream status for this user.",
      heading: "Subscription Preview",
      totalNodes: "Total Nodes",
      rawNodes: "Raw Nodes",
      upstreams: "Upstreams",
      upstreamStatus: "Upstream Status",
      nodes: "Nodes",
      table: {
        upstream: "Upstream",
        status: "Status",
        error: "Error",
      },
    },
    rotateDialog: {
      title: "Rotate User Token",
      description:
        "This will invalidate the current subscription URL and issue a new one.",
      confirmLabel: "Rotate Token",
    },
    deleteDialog: {
      title: "Delete User",
      description:
        "This will permanently remove the user and all of their data.",
      confirmLabel: "Delete User",
    },
    pageTitle: {
      withLabel: "{label} - Users",
      fallback: "Users",
    },
    toasts: {
      copied: "Copied",
      copiedNodes: "Copied Nodes",
      tagUpdateFailed: "Tag update failed",
      descriptionSaved: "Description saved",
      descriptionUpdateFailed: "Description update failed",
      tokenRotated: "Token Rotated",
      userActivated: "User activated",
      userDeactivated: "User deactivated",
      previewFailed: "Preview Failed",
    },
  },
  tagsList: {
    title: "Tags",
    addTagButton: "Add Tag",
    columns: {
      tag: "Tag",
      default: "Default",
      actions: "Actions",
    },
    manageButton: "Manage",
    createModal: {
      title: "Create Tag",
      description: "Create a new tag for assigning users and scoped sources.",
      tagNameLabel: "Tag Name",
      defaultCheckbox: "Default for new users",
    },
    editModal: {
      title: "Edit Tag",
      description: "Update tag properties and default behavior.",
      tagNameLabel: "Tag Name",
      defaultCheckbox: "Default for new users",
    },
    deleteDialog: {
      title: "Delete Tag",
      description:
        "Deleting this tag detaches it from users and removes tag-scoped sources.",
      confirmLabel: "Delete Tag",
    },
    toasts: {
      tagCreated: "Tag created",
      tagUpdated: "Tag updated",
      defaultStateUpdated: "Default state updated",
      tagDeleted: "Tag deleted",
      tagDeletedDetails:
        "{detachedUsers} users detached, {deletedUpstreams} upstreams removed, {deletedStaticNodes} static nodes removed",
    },
  },
  tagDetails: {
    saveTagButton: "Save Tag",
    deleteTagButton: "Delete Tag",
    headings: {
      tagSettings: "Tag Settings",
      usersInThisTag: "Users In This Tag",
      applyTagToExistingUsers: "Apply Tag To Existing Users",
      bulkUserActions: "Bulk User Actions",
      tagUpstreams: "Tag Upstreams",
      tagStaticNodes: "Tag Static Nodes",
    },
    fields: {
      tagName: "Tag Name",
      defaultForNewUsers: "Default for new users",
      selectUsersBatch: "Select Users (Batch)",
      selectUsersPlaceholder: "Select users to apply this tag",
      matchingUsersSummary: "Matching users: {total} | Selected: {selected}",
    },
    buttons: {
      applyToSelectedUsers: "Apply To Selected Users",
      applyToAllExistingUsers: "Apply To All Existing Users",
      deactivateUsers: "Deactivate Users",
      rotateTokens: "Rotate Tokens",
      deleteUsers: "Delete Users",
    },
    userTable: {
      user: "User",
      email: "Email",
      status: "Status",
      actions: "Actions",
    },
    pageTitle: {
      withName: "{name} - Tags",
      fallback: "Tag Details",
    },
    deleteDialog: {
      title: "Delete Tag",
      description:
        "Deleting this tag detaches all users and removes all tag-scoped sources.",
      confirmLabel: "Delete Tag",
    },
    actionDialog: {
      deleteUsers: {
        title: "Delete Tagged Users",
        description: "This permanently deletes users that contain this tag.",
        confirmLabel: "Delete Users",
      },
      deactivateUsers: {
        title: "Deactivate Tagged Users",
        description: "This deactivates users that contain this tag.",
        confirmLabel: "Deactivate Users",
      },
      rotateTokens: {
        title: "Rotate Tokens For Tagged Users",
        description: "This rotates tokens for users that contain this tag.",
        confirmLabel: "Rotate Tokens",
      },
    },
    toasts: {
      tagUpdated: "Tag updated",
      actionCompleted: "Action completed",
      actionCompletedDetails:
        "Matched {matchedUsers} users, affected {affectedUsers}",
      actionFailed: "Action failed",
      tagDeleted: "Tag deleted",
      deleteFailed: "Delete failed",
      tagAppliedToSelectedUsers: "Tag applied to selected users",
      tagAppliedToAllUsers: "Tag applied to all users",
      applyFailed: "Apply failed",
      applyDetails: "Matched {matchedUsers} users, affected {affectedUsers}",
    },
  },
  errors: {
    invalidUserId: "Invalid user id",
    invalidTagId: "Invalid tag id",
    userHasNoActiveToken: "User has no active token",
  },
};

type AdminUsersMessages = typeof en;

const fa: AdminUsersMessages = {
  usersList: {
    title: "کاربران",
    addUserButton: "افزودن کاربر",
    columns: {
      name: "نام",
      email: "ایمیل",
      description: "توضیحات",
      tags: "برچسب‌ها",
      status: "وضعیت",
      actions: "عملیات",
    },
    actions: {
      copySubscriptionUrl: "کپی URL اشتراک",
      previewSubscription: "پیش‌نمایش اشتراک",
      deactivateUser: "غیرفعال‌سازی کاربر",
      activateUser: "فعال‌سازی کاربر",
    },
    createModal: {
      title: "ایجاد کاربر",
      description: "کاربر جدید با ایمیل اختیاری و یادداشت مدیریتی ایجاد کنید.",
      heading: "ایجاد کاربر",
      labelField: "برچسب",
      emailField: "ایمیل",
      descriptionField: "توضیحات (فقط ادمین)",
      descriptionPlaceholder: "یادداشت داخلی برای این کاربر",
      tagsField: "برچسب‌ها",
      tagsPlaceholder: "انتخاب برچسب‌ها",
      tagsHint:
        "برچسب‌های پیش‌فرض به‌صورت خودکار برای کاربر جدید اضافه می‌شوند.",
    },
    previewModal: {
      title: "پیش‌نمایش: {label}",
      description: "پیش‌نمایش سریع اشتراک از جدول کاربران.",
      userFallback: "کاربر",
      uniqueNodes: "نودهای یکتا",
      rawNodes: "نودهای خام",
      upstreams: "منابع بالادستی",
      firstNodes: "اولین نودها",
      openFullPage: "باز کردن صفحه کامل",
    },
    deleteDialog: {
      title: "حذف کاربر",
      description: "این کاربر و تمام داده‌های مرتبط به‌صورت دائمی حذف می‌شوند.",
      confirmLabel: "حذف کاربر",
    },
    toasts: {
      userCreated: "کاربر ایجاد شد",
      tokenGenerated: "توکن با موفقیت ایجاد شد",
      subscriptionUrlCopied: "URL اشتراک کپی شد",
      copyFailed: "کپی ناموفق بود",
      previewFailed: "پیش‌نمایش ناموفق",
      statusUpdateFailed: "به‌روزرسانی وضعیت ناموفق بود",
      userActivated: "کاربر فعال شد",
      userDeactivated: "کاربر غیرفعال شد",
    },
  },
  userDetails: {
    previewSubscriptionButton: "پیش‌نمایش اشتراک",
    deactivateButton: "غیرفعال‌سازی",
    activateButton: "فعال‌سازی",
    deleteUserButton: "حذف کاربر",
    cards: {
      adminNotes: "یادداشت‌های مدیریتی",
      userTags: "برچسب‌های کاربر",
      subscriptionUrl: "URL اشتراک",
      userUpstreams: "منابع بالادستی کاربر",
      userStaticNodes: "نودهای ثابت کاربر",
    },
    fields: {
      descriptionAdminOnly: "توضیحات (فقط ادمین)",
      descriptionPlaceholder: "یادداشت داخلی برای این کاربر",
      assignedTags: "برچسب‌های تخصیص‌یافته",
      userTagsPlaceholder: "انتخاب برچسب‌های کاربر",
      tokenLabel: "توکن: {token}",
    },
    notes: {
      adminOnlyVisibility:
        "این یادداشت فقط در صفحات مدیریت کاربران قابل مشاهده است.",
      tagsSaving: "در حال ذخیره...",
      tagsAutosaveFailed:
        "ذخیره خودکار ناموفق بود. برای تلاش مجدد برچسب‌ها را دوباره ویرایش کنید.",
      tagsPendingSave: "در انتظار ذخیره...",
      tagsAutoSaved: "تغییرات به‌صورت خودکار ذخیره می‌شوند.",
    },
    buttons: {
      saveDescription: "ذخیره توضیحات",
      copy: "کپی",
      rotateToken: "چرخش توکن",
      copyNodes: "کپی",
    },
    previewModal: {
      title: "پیش‌نمایش اشتراک",
      description:
        "نودهای تولیدشده و وضعیت منابع بالادستی این کاربر را بررسی کنید.",
      heading: "پیش‌نمایش اشتراک",
      totalNodes: "کل نودها",
      rawNodes: "نودهای خام",
      upstreams: "منابع بالادستی",
      upstreamStatus: "وضعیت منابع بالادستی",
      nodes: "نودها",
      table: {
        upstream: "منبع بالادستی",
        status: "وضعیت",
        error: "خطا",
      },
    },
    rotateDialog: {
      title: "چرخش توکن کاربر",
      description:
        "URL اشتراک فعلی نامعتبر می‌شود و یک توکن جدید صادر می‌گردد.",
      confirmLabel: "چرخش توکن",
    },
    deleteDialog: {
      title: "حذف کاربر",
      description: "این کاربر و تمام داده‌های او به‌صورت دائمی حذف می‌شوند.",
      confirmLabel: "حذف کاربر",
    },
    pageTitle: {
      withLabel: "{label} - کاربران",
      fallback: "کاربران",
    },
    toasts: {
      copied: "کپی شد",
      copiedNodes: "نودها کپی شدند",
      tagUpdateFailed: "به‌روزرسانی برچسب ناموفق بود",
      descriptionSaved: "توضیحات ذخیره شد",
      descriptionUpdateFailed: "به‌روزرسانی توضیحات ناموفق بود",
      tokenRotated: "توکن چرخش یافت",
      userActivated: "کاربر فعال شد",
      userDeactivated: "کاربر غیرفعال شد",
      previewFailed: "پیش‌نمایش ناموفق",
    },
  },
  tagsList: {
    title: "برچسب‌ها",
    addTagButton: "افزودن برچسب",
    columns: {
      tag: "برچسب",
      default: "پیش‌فرض",
      actions: "عملیات",
    },
    manageButton: "مدیریت",
    createModal: {
      title: "ایجاد برچسب",
      description:
        "یک برچسب جدید برای تخصیص کاربران و منابع محدوده‌دار ایجاد کنید.",
      tagNameLabel: "نام برچسب",
      defaultCheckbox: "پیش‌فرض برای کاربران جدید",
    },
    editModal: {
      title: "ویرایش برچسب",
      description: "ویژگی‌های برچسب و رفتار پیش‌فرض آن را به‌روزرسانی کنید.",
      tagNameLabel: "نام برچسب",
      defaultCheckbox: "پیش‌فرض برای کاربران جدید",
    },
    deleteDialog: {
      title: "حذف برچسب",
      description:
        "با حذف این برچسب، اتصال آن از کاربران جدا شده و منابع سطح برچسب حذف می‌شوند.",
      confirmLabel: "حذف برچسب",
    },
    toasts: {
      tagCreated: "برچسب ایجاد شد",
      tagUpdated: "برچسب به‌روزرسانی شد",
      defaultStateUpdated: "وضعیت پیش‌فرض به‌روزرسانی شد",
      tagDeleted: "برچسب حذف شد",
      tagDeletedDetails:
        "{detachedUsers} کاربر جدا شد، {deletedUpstreams} منبع بالادستی حذف شد، {deletedStaticNodes} نود ثابت حذف شد",
    },
  },
  tagDetails: {
    saveTagButton: "ذخیره برچسب",
    deleteTagButton: "حذف برچسب",
    headings: {
      tagSettings: "تنظیمات برچسب",
      usersInThisTag: "کاربران این برچسب",
      applyTagToExistingUsers: "اعمال برچسب به کاربران موجود",
      bulkUserActions: "عملیات گروهی کاربران",
      tagUpstreams: "منابع بالادستی برچسب",
      tagStaticNodes: "نودهای ثابت برچسب",
    },
    fields: {
      tagName: "نام برچسب",
      defaultForNewUsers: "پیش‌فرض برای کاربران جدید",
      selectUsersBatch: "انتخاب کاربران (گروهی)",
      selectUsersPlaceholder: "کاربران برای اعمال این برچسب را انتخاب کنید",
      matchingUsersSummary: "کاربران منطبق: {total} | انتخاب‌شده: {selected}",
    },
    buttons: {
      applyToSelectedUsers: "اعمال به کاربران انتخاب‌شده",
      applyToAllExistingUsers: "اعمال به همه کاربران موجود",
      deactivateUsers: "غیرفعال‌سازی کاربران",
      rotateTokens: "چرخش توکن‌ها",
      deleteUsers: "حذف کاربران",
    },
    userTable: {
      user: "کاربر",
      email: "ایمیل",
      status: "وضعیت",
      actions: "عملیات",
    },
    pageTitle: {
      withName: "{name} - برچسب‌ها",
      fallback: "جزئیات برچسب",
    },
    deleteDialog: {
      title: "حذف برچسب",
      description:
        "با حذف این برچسب، همه کاربران جدا شده و همه منابع سطح برچسب حذف می‌شوند.",
      confirmLabel: "حذف برچسب",
    },
    actionDialog: {
      deleteUsers: {
        title: "حذف کاربران دارای برچسب",
        description:
          "این کار کاربران دارای این برچسب را به‌طور دائمی حذف می‌کند.",
        confirmLabel: "حذف کاربران",
      },
      deactivateUsers: {
        title: "غیرفعال‌سازی کاربران دارای برچسب",
        description: "این کار کاربران دارای این برچسب را غیرفعال می‌کند.",
        confirmLabel: "غیرفعال‌سازی کاربران",
      },
      rotateTokens: {
        title: "چرخش توکن کاربران دارای برچسب",
        description: "این کار توکن کاربران دارای این برچسب را چرخش می‌دهد.",
        confirmLabel: "چرخش توکن‌ها",
      },
    },
    toasts: {
      tagUpdated: "برچسب به‌روزرسانی شد",
      actionCompleted: "عملیات تکمیل شد",
      actionCompletedDetails:
        "{matchedUsers} کاربر منطبق، {affectedUsers} کاربر تحت تاثیر",
      actionFailed: "عملیات ناموفق بود",
      tagDeleted: "برچسب حذف شد",
      deleteFailed: "حذف ناموفق بود",
      tagAppliedToSelectedUsers: "برچسب به کاربران انتخاب‌شده اعمال شد",
      tagAppliedToAllUsers: "برچسب به همه کاربران اعمال شد",
      applyFailed: "اعمال ناموفق بود",
      applyDetails:
        "{matchedUsers} کاربر منطبق، {affectedUsers} کاربر تحت تاثیر",
    },
  },
  errors: {
    invalidUserId: "شناسه کاربر نامعتبر است",
    invalidTagId: "شناسه برچسب نامعتبر است",
    userHasNoActiveToken: "کاربر توکن فعال ندارد",
  },
};

const ru: AdminUsersMessages = {
  usersList: {
    title: "Пользователи",
    addUserButton: "Добавить пользователя",
    columns: {
      name: "Имя",
      email: "Email",
      description: "Описание",
      tags: "Теги",
      status: "Статус",
      actions: "Действия",
    },
    actions: {
      copySubscriptionUrl: "Скопировать URL подписки",
      previewSubscription: "Предпросмотр подписки",
      deactivateUser: "Деактивировать пользователя",
      activateUser: "Активировать пользователя",
    },
    createModal: {
      title: "Создать пользователя",
      description:
        "Добавьте нового пользователя с необязательным email и заметками только для админа.",
      heading: "Создать пользователя",
      labelField: "Метка",
      emailField: "Email",
      descriptionField: "Описание (только для админа)",
      descriptionPlaceholder: "Внутренняя заметка для пользователя",
      tagsField: "Теги",
      tagsPlaceholder: "Выберите теги",
      tagsHint:
        "Теги по умолчанию автоматически добавляются новым пользователям.",
    },
    previewModal: {
      title: "Предпросмотр: {label}",
      description:
        "Быстрый предпросмотр подписки прямо из таблицы пользователей.",
      userFallback: "Пользователь",
      uniqueNodes: "Уникальные ноды",
      rawNodes: "Сырые ноды",
      upstreams: "Upstream-источники",
      firstNodes: "Первые ноды",
      openFullPage: "Открыть полную страницу",
    },
    deleteDialog: {
      title: "Удалить пользователя",
      description:
        "Пользователь и все связанные данные будут удалены безвозвратно.",
      confirmLabel: "Удалить пользователя",
    },
    toasts: {
      userCreated: "Пользователь создан",
      tokenGenerated: "Токен успешно создан",
      subscriptionUrlCopied: "URL подписки скопирован",
      copyFailed: "Не удалось скопировать",
      previewFailed: "Ошибка предпросмотра",
      statusUpdateFailed: "Не удалось обновить статус",
      userActivated: "Пользователь активирован",
      userDeactivated: "Пользователь деактивирован",
    },
  },
  userDetails: {
    previewSubscriptionButton: "Предпросмотр подписки",
    deactivateButton: "Деактивировать",
    activateButton: "Активировать",
    deleteUserButton: "Удалить пользователя",
    cards: {
      adminNotes: "Заметки администратора",
      userTags: "Теги пользователя",
      subscriptionUrl: "URL подписки",
      userUpstreams: "Upstream-источники пользователя",
      userStaticNodes: "Статические ноды пользователя",
    },
    fields: {
      descriptionAdminOnly: "Описание (только для админа)",
      descriptionPlaceholder: "Внутренние заметки для пользователя",
      assignedTags: "Назначенные теги",
      userTagsPlaceholder: "Выберите теги пользователя",
      tokenLabel: "Токен: {token}",
    },
    notes: {
      adminOnlyVisibility:
        "Эта заметка видна только в админских экранах управления пользователями.",
      tagsSaving: "Сохранение...",
      tagsAutosaveFailed:
        "Автосохранение не удалось. Измените теги снова для повтора.",
      tagsPendingSave: "Ожидание сохранения...",
      tagsAutoSaved: "Изменения сохраняются автоматически.",
    },
    buttons: {
      saveDescription: "Сохранить описание",
      copy: "Копировать",
      rotateToken: "Ротировать токен",
      copyNodes: "Копировать",
    },
    previewModal: {
      title: "Предпросмотр подписки",
      description:
        "Проверьте сгенерированные ноды и статус upstream-источников для пользователя.",
      heading: "Предпросмотр подписки",
      totalNodes: "Всего нод",
      rawNodes: "Сырые ноды",
      upstreams: "Upstream-источники",
      upstreamStatus: "Статус upstream-источников",
      nodes: "Ноды",
      table: {
        upstream: "Upstream",
        status: "Статус",
        error: "Ошибка",
      },
    },
    rotateDialog: {
      title: "Ротировать токен пользователя",
      description:
        "Текущий URL подписки станет недействительным, будет выдан новый токен.",
      confirmLabel: "Ротировать токен",
    },
    deleteDialog: {
      title: "Удалить пользователя",
      description: "Пользователь и все его данные будут удалены безвозвратно.",
      confirmLabel: "Удалить пользователя",
    },
    pageTitle: {
      withLabel: "{label} - Пользователи",
      fallback: "Пользователи",
    },
    toasts: {
      copied: "Скопировано",
      copiedNodes: "Ноды скопированы",
      tagUpdateFailed: "Не удалось обновить теги",
      descriptionSaved: "Описание сохранено",
      descriptionUpdateFailed: "Не удалось обновить описание",
      tokenRotated: "Токен ротирован",
      userActivated: "Пользователь активирован",
      userDeactivated: "Пользователь деактивирован",
      previewFailed: "Ошибка предпросмотра",
    },
  },
  tagsList: {
    title: "Теги",
    addTagButton: "Добавить тег",
    columns: {
      tag: "Тег",
      default: "По умолчанию",
      actions: "Действия",
    },
    manageButton: "Управлять",
    createModal: {
      title: "Создать тег",
      description:
        "Создайте новый тег для назначения пользователей и источников по области.",
      tagNameLabel: "Название тега",
      defaultCheckbox: "По умолчанию для новых пользователей",
    },
    editModal: {
      title: "Редактировать тег",
      description: "Обновите свойства тега и поведение по умолчанию.",
      tagNameLabel: "Название тега",
      defaultCheckbox: "По умолчанию для новых пользователей",
    },
    deleteDialog: {
      title: "Удалить тег",
      description:
        "Удаление тега отвязывает его от пользователей и удаляет источники уровня тега.",
      confirmLabel: "Удалить тег",
    },
    toasts: {
      tagCreated: "Тег создан",
      tagUpdated: "Тег обновлен",
      defaultStateUpdated: "Состояние по умолчанию обновлено",
      tagDeleted: "Тег удален",
      tagDeletedDetails:
        "Пользователей отвязано: {detachedUsers}, upstream удалено: {deletedUpstreams}, статических нод удалено: {deletedStaticNodes}",
    },
  },
  tagDetails: {
    saveTagButton: "Сохранить тег",
    deleteTagButton: "Удалить тег",
    headings: {
      tagSettings: "Настройки тега",
      usersInThisTag: "Пользователи этого тега",
      applyTagToExistingUsers: "Применить тег к существующим пользователям",
      bulkUserActions: "Групповые действия с пользователями",
      tagUpstreams: "Upstream-источники тега",
      tagStaticNodes: "Статические ноды тега",
    },
    fields: {
      tagName: "Название тега",
      defaultForNewUsers: "По умолчанию для новых пользователей",
      selectUsersBatch: "Выбрать пользователей (пакет)",
      selectUsersPlaceholder: "Выберите пользователей для применения тега",
      matchingUsersSummary:
        "Подходящих пользователей: {total} | Выбрано: {selected}",
    },
    buttons: {
      applyToSelectedUsers: "Применить к выбранным",
      applyToAllExistingUsers: "Применить ко всем существующим",
      deactivateUsers: "Деактивировать пользователей",
      rotateTokens: "Ротировать токены",
      deleteUsers: "Удалить пользователей",
    },
    userTable: {
      user: "Пользователь",
      email: "Email",
      status: "Статус",
      actions: "Действия",
    },
    pageTitle: {
      withName: "{name} - Теги",
      fallback: "Детали тега",
    },
    deleteDialog: {
      title: "Удалить тег",
      description:
        "Удаление тега отвяжет всех пользователей и удалит все источники уровня тега.",
      confirmLabel: "Удалить тег",
    },
    actionDialog: {
      deleteUsers: {
        title: "Удалить пользователей с тегом",
        description: "Безвозвратно удаляет пользователей с этим тегом.",
        confirmLabel: "Удалить пользователей",
      },
      deactivateUsers: {
        title: "Деактивировать пользователей с тегом",
        description: "Деактивирует пользователей с этим тегом.",
        confirmLabel: "Деактивировать пользователей",
      },
      rotateTokens: {
        title: "Ротировать токены пользователей с тегом",
        description: "Ротирует токены пользователей с этим тегом.",
        confirmLabel: "Ротировать токены",
      },
    },
    toasts: {
      tagUpdated: "Тег обновлен",
      actionCompleted: "Действие завершено",
      actionCompletedDetails:
        "Подходящих пользователей: {matchedUsers}, затронуто: {affectedUsers}",
      actionFailed: "Не удалось выполнить действие",
      tagDeleted: "Тег удален",
      deleteFailed: "Не удалось удалить",
      tagAppliedToSelectedUsers: "Тег применен к выбранным пользователям",
      tagAppliedToAllUsers: "Тег применен ко всем пользователям",
      applyFailed: "Не удалось применить",
      applyDetails:
        "Подходящих пользователей: {matchedUsers}, затронуто: {affectedUsers}",
    },
  },
  errors: {
    invalidUserId: "Некорректный ID пользователя",
    invalidTagId: "Некорректный ID тега",
    userHasNoActiveToken: "У пользователя нет активного токена",
  },
};

const zh: AdminUsersMessages = {
  usersList: {
    title: "用户",
    addUserButton: "新增用户",
    columns: {
      name: "名称",
      email: "邮箱",
      description: "描述",
      tags: "标签",
      status: "状态",
      actions: "操作",
    },
    actions: {
      copySubscriptionUrl: "复制订阅 URL",
      previewSubscription: "预览订阅",
      deactivateUser: "停用用户",
      activateUser: "启用用户",
    },
    createModal: {
      title: "创建用户",
      description: "创建新用户，可选邮箱和仅管理员可见备注。",
      heading: "创建用户",
      labelField: "标识",
      emailField: "邮箱",
      descriptionField: "描述（仅管理员）",
      descriptionPlaceholder: "该用户的内部备注",
      tagsField: "标签",
      tagsPlaceholder: "选择标签",
      tagsHint: "新用户会自动添加默认标签。",
    },
    previewModal: {
      title: "预览：{label}",
      description: "在用户表中快速预览订阅内容。",
      userFallback: "用户",
      uniqueNodes: "去重节点",
      rawNodes: "原始节点",
      upstreams: "上游来源",
      firstNodes: "前几个节点",
      openFullPage: "打开完整页面",
    },
    deleteDialog: {
      title: "删除用户",
      description: "将永久删除该用户及其所有相关数据。",
      confirmLabel: "删除用户",
    },
    toasts: {
      userCreated: "用户已创建",
      tokenGenerated: "令牌生成成功",
      subscriptionUrlCopied: "订阅 URL 已复制",
      copyFailed: "复制失败",
      previewFailed: "预览失败",
      statusUpdateFailed: "状态更新失败",
      userActivated: "用户已启用",
      userDeactivated: "用户已停用",
    },
  },
  userDetails: {
    previewSubscriptionButton: "预览订阅",
    deactivateButton: "停用",
    activateButton: "启用",
    deleteUserButton: "删除用户",
    cards: {
      adminNotes: "管理员备注",
      userTags: "用户标签",
      subscriptionUrl: "订阅 URL",
      userUpstreams: "用户上游来源",
      userStaticNodes: "用户静态节点",
    },
    fields: {
      descriptionAdminOnly: "描述（仅管理员）",
      descriptionPlaceholder: "该用户的内部备注",
      assignedTags: "已分配标签",
      userTagsPlaceholder: "选择用户标签",
      tokenLabel: "令牌：{token}",
    },
    notes: {
      adminOnlyVisibility: "该备注仅在管理员用户管理页面可见。",
      tagsSaving: "保存中...",
      tagsAutosaveFailed: "自动保存失败。请再次编辑标签重试。",
      tagsPendingSave: "等待保存...",
      tagsAutoSaved: "更改会自动保存。",
    },
    buttons: {
      saveDescription: "保存描述",
      copy: "复制",
      rotateToken: "轮换令牌",
      copyNodes: "复制",
    },
    previewModal: {
      title: "订阅预览",
      description: "查看该用户生成节点与上游状态。",
      heading: "订阅预览",
      totalNodes: "节点总数",
      rawNodes: "原始节点",
      upstreams: "上游来源",
      upstreamStatus: "上游状态",
      nodes: "节点",
      table: {
        upstream: "上游",
        status: "状态",
        error: "错误",
      },
    },
    rotateDialog: {
      title: "轮换用户令牌",
      description: "当前订阅 URL 将失效并立即签发新令牌。",
      confirmLabel: "轮换令牌",
    },
    deleteDialog: {
      title: "删除用户",
      description: "将永久删除该用户及其全部数据。",
      confirmLabel: "删除用户",
    },
    pageTitle: {
      withLabel: "{label} - 用户",
      fallback: "用户",
    },
    toasts: {
      copied: "已复制",
      copiedNodes: "节点已复制",
      tagUpdateFailed: "标签更新失败",
      descriptionSaved: "描述已保存",
      descriptionUpdateFailed: "描述更新失败",
      tokenRotated: "令牌已轮换",
      userActivated: "用户已启用",
      userDeactivated: "用户已停用",
      previewFailed: "预览失败",
    },
  },
  tagsList: {
    title: "标签",
    addTagButton: "新增标签",
    columns: {
      tag: "标签",
      default: "默认",
      actions: "操作",
    },
    manageButton: "管理",
    createModal: {
      title: "创建标签",
      description: "创建新标签用于分配用户及标签范围来源。",
      tagNameLabel: "标签名称",
      defaultCheckbox: "新用户默认标签",
    },
    editModal: {
      title: "编辑标签",
      description: "更新标签属性及默认行为。",
      tagNameLabel: "标签名称",
      defaultCheckbox: "新用户默认标签",
    },
    deleteDialog: {
      title: "删除标签",
      description: "删除该标签会将其从用户解绑并移除标签范围来源。",
      confirmLabel: "删除标签",
    },
    toasts: {
      tagCreated: "标签已创建",
      tagUpdated: "标签已更新",
      defaultStateUpdated: "默认状态已更新",
      tagDeleted: "标签已删除",
      tagDeletedDetails:
        "已解绑用户 {detachedUsers}，已删除上游 {deletedUpstreams}，已删除静态节点 {deletedStaticNodes}",
    },
  },
  tagDetails: {
    saveTagButton: "保存标签",
    deleteTagButton: "删除标签",
    headings: {
      tagSettings: "标签设置",
      usersInThisTag: "该标签下的用户",
      applyTagToExistingUsers: "将标签应用到现有用户",
      bulkUserActions: "批量用户操作",
      tagUpstreams: "标签上游来源",
      tagStaticNodes: "标签静态节点",
    },
    fields: {
      tagName: "标签名称",
      defaultForNewUsers: "新用户默认标签",
      selectUsersBatch: "选择用户（批量）",
      selectUsersPlaceholder: "选择要应用该标签的用户",
      matchingUsersSummary: "匹配用户：{total} | 已选择：{selected}",
    },
    buttons: {
      applyToSelectedUsers: "应用到已选用户",
      applyToAllExistingUsers: "应用到全部现有用户",
      deactivateUsers: "停用用户",
      rotateTokens: "轮换令牌",
      deleteUsers: "删除用户",
    },
    userTable: {
      user: "用户",
      email: "邮箱",
      status: "状态",
      actions: "操作",
    },
    pageTitle: {
      withName: "{name} - 标签",
      fallback: "标签详情",
    },
    deleteDialog: {
      title: "删除标签",
      description: "删除该标签会解绑所有用户并移除所有标签范围来源。",
      confirmLabel: "删除标签",
    },
    actionDialog: {
      deleteUsers: {
        title: "删除带标签用户",
        description: "将永久删除包含该标签的用户。",
        confirmLabel: "删除用户",
      },
      deactivateUsers: {
        title: "停用带标签用户",
        description: "将停用包含该标签的用户。",
        confirmLabel: "停用用户",
      },
      rotateTokens: {
        title: "轮换带标签用户令牌",
        description: "将轮换包含该标签用户的令牌。",
        confirmLabel: "轮换令牌",
      },
    },
    toasts: {
      tagUpdated: "标签已更新",
      actionCompleted: "操作完成",
      actionCompletedDetails:
        "匹配用户 {matchedUsers}，影响用户 {affectedUsers}",
      actionFailed: "操作失败",
      tagDeleted: "标签已删除",
      deleteFailed: "删除失败",
      tagAppliedToSelectedUsers: "标签已应用到已选用户",
      tagAppliedToAllUsers: "标签已应用到全部用户",
      applyFailed: "应用失败",
      applyDetails: "匹配用户 {matchedUsers}，影响用户 {affectedUsers}",
    },
  },
  errors: {
    invalidUserId: "无效的用户 ID",
    invalidTagId: "无效的标签 ID",
    userHasNoActiveToken: "该用户没有有效令牌",
  },
};

export const adminUsersMessages = {
  en,
  fa,
  ru,
  zh,
};
