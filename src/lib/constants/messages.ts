/**
 * Messages Constants
 * Centralized error, success, and validation messages
 */

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
  SIGNUP_SUCCESS: 'تم إنشاء الحساب بنجاح',
  PASSWORD_RESET_SENT: 'تم إرسال رابط إعادة تعيين كلمة المرور',
  PASSWORD_RESET_SUCCESS: 'تم إعادة تعيين كلمة المرور بنجاح',
  EMAIL_VERIFIED: 'تم تأكيد البريد الإلكتروني بنجاح',
  VERIFICATION_EMAIL_SENT: 'تم إرسال بريد التأكيد',
  
  // Profile
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  PROFILE_COMPLETED: 'تم إكمال الملف الشخصي بنجاح',
  AVATAR_UPLOADED: 'تم رفع الصورة الشخصية بنجاح',
  DOCUMENT_UPLOADED: 'تم رفع المستند بنجاح',
  DOCUMENT_DELETED: 'تم حذف المستند بنجاح',
  
  // Matching
  MATCH_LIKED: 'تم إرسال الإعجاب بنجاح',
  MATCH_PASSED: 'تم تخطي المطابقة',
  GROUP_JOINED: 'تم الانضمام للمجموعة بنجاح',
  GROUP_LEFT: 'تم مغادرة المجموعة بنجاح',
  
  // Messaging
  MESSAGE_SENT: 'تم إرسال الرسالة بنجاح',
  MESSAGE_DELETED: 'تم حذف الرسالة بنجاح',
  CONVERSATION_DELETED: 'تم حذف المحادثة بنجاح',
  
  // Notifications
  NOTIFICATION_DELETED: 'تم حذف الإشعار بنجاح',
  ALL_NOTIFICATIONS_READ: 'تم تمييز جميع الإشعارات كمقروءة',
  NOTIFICATION_PREFERENCES_UPDATED: 'تم تحديث تفضيلات الإشعارات',
  
  // Payments
  PAYMENT_SUCCESS: 'تم الدفع بنجاح',
  SUBSCRIPTION_CREATED: 'تم إنشاء الاشتراك بنجاح',
  SUBSCRIPTION_UPDATED: 'تم تحديث الاشتراك بنجاح',
  SUBSCRIPTION_CANCELLED: 'تم إلغاء الاشتراك بنجاح',
  PAYMENT_METHOD_ADDED: 'تم إضافة طريقة الدفع بنجاح',
  PAYMENT_METHOD_DELETED: 'تم حذف طريقة الدفع بنجاح',
  
  // Verification
  VERIFICATION_SUBMITTED: 'تم إرسال طلب التحقق بنجاح',
  VERIFICATION_APPROVED: 'تم الموافقة على التحقق',
  VERIFICATION_REJECTED: 'تم رفض التحقق',
  
  // General
  SETTINGS_UPDATED: 'تم تحديث الإعدادات بنجاح',
  DATA_SAVED: 'تم حفظ البيانات بنجاح',
  OPERATION_SUCCESS: 'تمت العملية بنجاح',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  // General Errors
  GENERIC_ERROR: 'حدث خطأ غير متوقع',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  SERVER_ERROR: 'خطأ في الخادم',
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  FORBIDDEN: 'ممنوع الوصول',
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  CONFLICT_ERROR: 'تعارض في البيانات',
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  RATE_LIMIT_EXCEEDED: 'تم تجاوز الحد المسموح من الطلبات',
  
  // Authentication Errors
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  ACCOUNT_NOT_FOUND: 'الحساب غير موجود',
  ACCOUNT_ALREADY_EXISTS: 'الحساب موجود بالفعل',
  ACCOUNT_DISABLED: 'الحساب معطل',
  ACCOUNT_NOT_VERIFIED: 'الحساب غير مؤكد',
  INVALID_TOKEN: 'رمز التحقق غير صحيح',
  TOKEN_EXPIRED: 'انتهت صلاحية رمز التحقق',
  PASSWORD_TOO_WEAK: 'كلمة المرور ضعيفة جداً',
  PASSWORDS_DO_NOT_MATCH: 'كلمات المرور غير متطابقة',
  OLD_PASSWORD_INCORRECT: 'كلمة المرور القديمة غير صحيحة',
  
  // Profile Errors
  PROFILE_NOT_FOUND: 'الملف الشخصي غير موجود',
  PROFILE_INCOMPLETE: 'الملف الشخصي غير مكتمل',
  INVALID_AVATAR_FORMAT: 'تنسيق الصورة غير صحيح',
  AVATAR_TOO_LARGE: 'حجم الصورة كبير جداً',
  DOCUMENT_TOO_LARGE: 'حجم المستند كبير جداً',
  INVALID_DOCUMENT_FORMAT: 'تنسيق المستند غير صحيح',
  
  // Matching Errors
  MATCH_NOT_FOUND: 'المطابقة غير موجودة',
  ALREADY_LIKED: 'تم الإعجاب بهذا المستخدم من قبل',
  ALREADY_PASSED: 'تم تخطي هذا المستخدم من قبل',
  GROUP_FULL: 'المجموعة ممتلئة',
  GROUP_NOT_FOUND: 'المجموعة غير موجودة',
  ALREADY_IN_GROUP: 'أنت عضو في هذه المجموعة بالفعل',
  NOT_IN_GROUP: 'لست عضواً في هذه المجموعة',
  
  // Messaging Errors
  CONVERSATION_NOT_FOUND: 'المحادثة غير موجودة',
  MESSAGE_NOT_FOUND: 'الرسالة غير موجودة',
  CANNOT_MESSAGE_SELF: 'لا يمكن إرسال رسالة لنفسك',
  CANNOT_MESSAGE_UNMATCHED: 'لا يمكن إرسال رسالة لمستخدم غير متطابق',
  
  // Payment Errors
  PAYMENT_FAILED: 'فشل في الدفع',
  INVALID_PAYMENT_METHOD: 'طريقة الدفع غير صحيحة',
  PAYMENT_METHOD_NOT_FOUND: 'طريقة الدفع غير موجودة',
  SUBSCRIPTION_NOT_FOUND: 'الاشتراك غير موجود',
  SUBSCRIPTION_EXPIRED: 'انتهت صلاحية الاشتراك',
  INSUFFICIENT_FUNDS: 'رصيد غير كافي',
  
  // Verification Errors
  VERIFICATION_NOT_FOUND: 'طلب التحقق غير موجود',
  VERIFICATION_ALREADY_SUBMITTED: 'تم إرسال طلب التحقق من قبل',
  VERIFICATION_ALREADY_APPROVED: 'تم الموافقة على التحقق من قبل',
  INVALID_DOCUMENT: 'المستند غير صحيح',
  DOCUMENT_EXPIRED: 'انتهت صلاحية المستند',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
  INVALID_FILE_TYPE: 'نوع الملف غير صحيح',
  UPLOAD_FAILED: 'فشل في رفع الملف',
  FILE_NOT_FOUND: 'الملف غير موجود',
  
  // Admin Errors
  ADMIN_ACCESS_REQUIRED: 'مطلوب صلاحيات إدارية',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  CANNOT_DELETE_SELF: 'لا يمكن حذف حسابك الخاص',
  CANNOT_MODIFY_ADMIN: 'لا يمكن تعديل حساب المدير',
} as const

// Validation Messages
export const VALIDATION_MESSAGES = {
  // Required Fields
  REQUIRED: 'هذا الحقل مطلوب',
  REQUIRED_FIELD: (field: string) => `${field} مطلوب`,
  
  // Text Validation
  MIN_LENGTH: (min: number) => `يجب أن يكون النص ${min} أحرف على الأقل`,
  MAX_LENGTH: (max: number) => `يجب أن يكون النص ${max} أحرف على الأكثر`,
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  INVALID_URL: 'الرابط غير صحيح',
  
  // Number Validation
  MIN_VALUE: (min: number) => `يجب أن تكون القيمة ${min} على الأقل`,
  MAX_VALUE: (max: number) => `يجب أن تكون القيمة ${max} على الأكثر`,
  INVALID_NUMBER: 'رقم غير صحيح',
  POSITIVE_NUMBER: 'يجب أن يكون الرقم موجب',
  
  // Date Validation
  INVALID_DATE: 'تاريخ غير صحيح',
  FUTURE_DATE: 'يجب أن يكون التاريخ في المستقبل',
  PAST_DATE: 'يجب أن يكون التاريخ في الماضي',
  MIN_AGE: (min: number) => `يجب أن يكون العمر ${min} سنة على الأقل`,
  MAX_AGE: (max: number) => `يجب أن يكون العمر ${max} سنة على الأكثر`,
  
  // File Validation
  INVALID_FILE_SIZE: (maxSize: string) => `حجم الملف يجب أن يكون ${maxSize} أو أقل`,
  INVALID_FILE_TYPE: (allowedTypes: string[]) => `نوع الملف يجب أن يكون: ${allowedTypes.join(', ')}`,
  
  // Password Validation
  PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة جداً',
  PASSWORD_TOO_LONG: 'كلمة المرور طويلة جداً',
  PASSWORD_MUST_CONTAIN_UPPERCASE: 'كلمة المرور يجب أن تحتوي على حرف كبير',
  PASSWORD_MUST_CONTAIN_LOWERCASE: 'كلمة المرور يجب أن تحتوي على حرف صغير',
  PASSWORD_MUST_CONTAIN_NUMBER: 'كلمة المرور يجب أن تحتوي على رقم',
  PASSWORD_MUST_CONTAIN_SPECIAL: 'كلمة المرور يجب أن تحتوي على رمز خاص',
  
  // Array Validation
  MIN_ITEMS: (min: number) => `يجب اختيار ${min} عنصر على الأقل`,
  MAX_ITEMS: (max: number) => `يجب اختيار ${max} عنصر على الأكثر`,
  UNIQUE_ITEMS: 'العناصر يجب أن تكون فريدة',
  
  // Custom Validation
  INVALID_SELECTION: 'اختيار غير صحيح',
  INVALID_FORMAT: 'تنسيق غير صحيح',
  MUST_AGREE: 'يجب الموافقة على الشروط',
} as const

// Warning Messages
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'لديك تغييرات غير محفوظة',
  CONFIRM_DELETE: 'هل أنت متأكد من الحذف؟',
  CONFIRM_LOGOUT: 'هل أنت متأكد من تسجيل الخروج؟',
  CONFIRM_CANCEL: 'هل أنت متأكد من الإلغاء؟',
  DATA_LOSS: 'قد تفقد البيانات غير المحفوظة',
  SESSION_EXPIRING: 'ستنتهي جلسة العمل قريباً',
  FEATURE_BETA: 'هذه الميزة في مرحلة التجربة',
  MAINTENANCE_MODE: 'الموقع في وضع الصيانة',
} as const

// Info Messages
export const INFO_MESSAGES = {
  LOADING: 'جاري التحميل...',
  SAVING: 'جاري الحفظ...',
  PROCESSING: 'جاري المعالجة...',
  UPLOADING: 'جاري الرفع...',
  SENDING: 'جاري الإرسال...',
  NO_DATA: 'لا توجد بيانات',
  NO_RESULTS: 'لا توجد نتائج',
  SEARCH_PLACEHOLDER: 'ابحث هنا...',
  SELECT_OPTION: 'اختر خياراً',
  ALL_FIELDS_REQUIRED: 'جميع الحقول مطلوبة',
  OPTIONAL_FIELD: 'حقل اختياري',
  COMING_SOON: 'قريباً',
  UNDER_DEVELOPMENT: 'قيد التطوير',
} as const

// Message Types
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

// Message Categories
export const MESSAGE_CATEGORIES = {
  AUTH: 'authentication',
  PROFILE: 'profile',
  MATCHING: 'matching',
  MESSAGING: 'messaging',
  PAYMENT: 'payment',
  VERIFICATION: 'verification',
  GENERAL: 'general',
} as const

// Helper Functions
export const getMessage = (category: keyof typeof MESSAGE_CATEGORIES, type: keyof typeof MESSAGE_TYPES, key: string): string => {
  const messages = {
    [MESSAGE_TYPES.SUCCESS]: SUCCESS_MESSAGES,
    [MESSAGE_TYPES.ERROR]: ERROR_MESSAGES,
    [MESSAGE_TYPES.WARNING]: WARNING_MESSAGES,
    [MESSAGE_TYPES.INFO]: INFO_MESSAGES,
  }
  
  return messages[type][key as keyof typeof messages[typeof type]] || 'رسالة غير معروفة'
}

export const getValidationMessage = (key: string, ...params: any[]): string => {
  const message = VALIDATION_MESSAGES[key as keyof typeof VALIDATION_MESSAGES]
  if (typeof message === 'function') {
    return message(...params)
  }
  return message || 'رسالة تحقق غير معروفة'
}
