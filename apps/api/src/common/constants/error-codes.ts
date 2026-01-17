/**
 * Application Error Codes
 *
 * Standardized error codes for the API
 * Format: DOMAIN_ACTION_REASON
 */

// ==================== Authentication Errors ====================
export enum AuthErrorCode {
  // Login/Registration
  INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "AUTH_EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD = "AUTH_WEAK_PASSWORD",

  // Token
  TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  TOKEN_INVALID = "AUTH_TOKEN_INVALID",
  TOKEN_MISSING = "AUTH_TOKEN_MISSING",
  REFRESH_TOKEN_EXPIRED = "AUTH_REFRESH_TOKEN_EXPIRED",

  // Authorization
  FORBIDDEN = "AUTH_FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "AUTH_INSUFFICIENT_PERMISSIONS",
  ROLE_REQUIRED = "AUTH_ROLE_REQUIRED",
}

// ==================== Validation Errors ====================
export enum ValidationErrorCode {
  REQUIRED_FIELD = "VALIDATION_REQUIRED_FIELD",
  INVALID_FORMAT = "VALIDATION_INVALID_FORMAT",
  INVALID_TYPE = "VALIDATION_INVALID_TYPE",
  OUT_OF_RANGE = "VALIDATION_OUT_OF_RANGE",
  UNIQUE_CONSTRAINT = "VALIDATION_UNIQUE_CONSTRAINT",
  INVALID_ENUM_VALUE = "VALIDATION_INVALID_ENUM_VALUE",
  STRING_TOO_LONG = "VALIDATION_STRING_TOO_LONG",
  STRING_TOO_SHORT = "VALIDATION_STRING_TOO_SHORT",
  INVALID_DATE = "VALIDATION_INVALID_DATE",
  INVALID_UUID = "VALIDATION_INVALID_UUID",
}

// ==================== Resource Errors ====================
export enum ResourceErrorCode {
  // Generic
  NOT_FOUND = "RESOURCE_NOT_FOUND",
  ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  CONFLICT = "RESOURCE_CONFLICT",
  LOCKED = "RESOURCE_LOCKED",

  // Aircraft
  AIRCRAFT_NOT_FOUND = "AIRCRAFT_NOT_FOUND",
  AIRCRAFT_NOT_RELEASED = "AIRCRAFT_NOT_RELEASED",
  AIRCRAFT_GROUNDED = "AIRCRAFT_GROUNDED",

  // Component
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
  COMPONENT_ALREADY_INSTALLED = "COMPONENT_ALREADY_INSTALLED",
  COMPONENT_NOT_INSTALLED = "COMPONENT_NOT_INSTALLED",
  COMPONENT_LIFE_LIMIT_EXCEEDED = "COMPONENT_LIFE_LIMIT_EXCEEDED",

  // Work Order
  WORK_ORDER_NOT_FOUND = "WORK_ORDER_NOT_FOUND",
  WORK_ORDER_ALREADY_COMPLETED = "WORK_ORDER_ALREADY_COMPLETED",
  WORK_ORDER_ALREADY_RELEASED = "WORK_ORDER_ALREADY_RELEASED",
  WORK_ORDER_CANNOT_BE_MODIFIED = "WORK_ORDER_CANNOT_BE_MODIFIED",

  // Task
  TASK_NOT_FOUND = "TASK_NOT_FOUND",
  TASK_RII_NOT_SIGNED = "TASK_RII_NOT_SIGNED",
  TASK_NOT_COMPLETED = "TASK_NOT_COMPLETED",

  // Inventory
  INVENTORY_ITEM_NOT_FOUND = "INVENTORY_ITEM_NOT_FOUND",
  INSUFFICIENT_STOCK = "INVENTORY_INSUFFICIENT_STOCK",
  WAREHOUSE_NOT_FOUND = "WAREHOUSE_NOT_FOUND",

  // Purchase
  PURCHASE_REQUEST_NOT_FOUND = "PURCHASE_REQUEST_NOT_FOUND",
  PURCHASE_ORDER_NOT_FOUND = "PURCHASE_ORDER_NOT_FOUND",
  SUPPLIER_NOT_FOUND = "SUPPLIER_NOT_FOUND",

  // Maintenance
  MAINTENANCE_SCHEDULE_NOT_FOUND = "MAINTENANCE_SCHEDULE_NOT_FOUND",
  MAINTENANCE_PROGRAM_NOT_FOUND = "MAINTENANCE_PROGRAM_NOT_FOUND",
  MAINTENANCE_TRIGGER_NOT_FOUND = "MAINTENANCE_TRIGGER_NOT_FOUND",

  // Flight
  FLIGHT_LOG_NOT_FOUND = "FLIGHT_LOG_NOT_FOUND",
  PILOT_REPORT_NOT_FOUND = "PILOT_REPORT_NOT_FOUND",
  RELEASE_RECORD_NOT_FOUND = "RELEASE_RECORD_NOT_FOUND",
}

// ==================== Business Logic Errors ====================
export enum BusinessErrorCode {
  // State Transitions
  INVALID_STATE_TRANSITION = "BUSINESS_INVALID_STATE_TRANSITION",
  OPERATION_NOT_ALLOWED = "BUSINESS_OPERATION_NOT_ALLOWED",

  // Workflow
  APPROVAL_REQUIRED = "BUSINESS_APPROVAL_REQUIRED",
  ALREADY_APPROVED = "BUSINESS_ALREADY_APPROVED",
  ALREADY_REJECTED = "BUSINESS_ALREADY_REJECTED",
  CANNOT_CANCEL = "BUSINESS_CANNOT_CANCEL",

  // Maintenance
  MAINTENANCE_DUE = "BUSINESS_MAINTENANCE_DUE",
  MAINTENANCE_OVERDUE = "BUSINESS_MAINTENANCE_OVERDUE",
  RII_SIGNATURE_REQUIRED = "BUSINESS_RII_SIGNATURE_REQUIRED",

  // Release
  RELEASE_SIGNATURE_REQUIRED = "BUSINESS_RELEASE_SIGNATURE_REQUIRED",
  RELEASE_ALREADY_SIGNED = "BUSINESS_RELEASE_ALREADY_SIGNED",

  // Inventory
  RESERVATION_FAILED = "BUSINESS_RESERVATION_FAILED",
  RELEASE_FAILED = "BUSINESS_RELEASE_FAILED",
}

// ==================== System Errors ====================
export enum SystemErrorCode {
  INTERNAL_ERROR = "SYSTEM_INTERNAL_ERROR",
  DATABASE_ERROR = "SYSTEM_DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "SYSTEM_EXTERNAL_SERVICE_ERROR",
  CONFIGURATION_ERROR = "SYSTEM_CONFIGURATION_ERROR",
  RATE_LIMIT_EXCEEDED = "SYSTEM_RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SYSTEM_SERVICE_UNAVAILABLE",
}

// ==================== All Error Codes Union ====================
export type ErrorCode =
  | AuthErrorCode
  | ValidationErrorCode
  | ResourceErrorCode
  | BusinessErrorCode
  | SystemErrorCode;

// ==================== Error Messages (Chinese) ====================
export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth
  [AuthErrorCode.INVALID_CREDENTIALS]: "用户名或密码错误",
  [AuthErrorCode.USER_NOT_FOUND]: "用户不存在",
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: "邮箱已被注册",
  [AuthErrorCode.WEAK_PASSWORD]: "密码强度不足",
  [AuthErrorCode.TOKEN_EXPIRED]: "登录已过期，请重新登录",
  [AuthErrorCode.TOKEN_INVALID]: "无效的访问令牌",
  [AuthErrorCode.TOKEN_MISSING]: "请先登录",
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: "刷新令牌已过期",
  [AuthErrorCode.FORBIDDEN]: "没有访问权限",
  [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: "权限不足",
  [AuthErrorCode.ROLE_REQUIRED]: "需要特定角色权限",

  // Validation
  [ValidationErrorCode.REQUIRED_FIELD]: "必填字段缺失",
  [ValidationErrorCode.INVALID_FORMAT]: "格式不正确",
  [ValidationErrorCode.INVALID_TYPE]: "类型不正确",
  [ValidationErrorCode.OUT_OF_RANGE]: "数值超出范围",
  [ValidationErrorCode.UNIQUE_CONSTRAINT]: "该值已存在",
  [ValidationErrorCode.INVALID_ENUM_VALUE]: "无效的枚举值",
  [ValidationErrorCode.STRING_TOO_LONG]: "字符串过长",
  [ValidationErrorCode.STRING_TOO_SHORT]: "字符串过短",
  [ValidationErrorCode.INVALID_DATE]: "无效的日期",
  [ValidationErrorCode.INVALID_UUID]: "无效的 ID 格式",

  // Resource
  [ResourceErrorCode.NOT_FOUND]: "资源不存在",
  [ResourceErrorCode.ALREADY_EXISTS]: "资源已存在",
  [ResourceErrorCode.CONFLICT]: "资源冲突",
  [ResourceErrorCode.LOCKED]: "资源已锁定",
  [ResourceErrorCode.AIRCRAFT_NOT_FOUND]: "飞行器不存在",
  [ResourceErrorCode.AIRCRAFT_NOT_RELEASED]: "飞行器未放行",
  [ResourceErrorCode.AIRCRAFT_GROUNDED]: "飞行器已停飞",
  [ResourceErrorCode.COMPONENT_NOT_FOUND]: "部件不存在",
  [ResourceErrorCode.COMPONENT_ALREADY_INSTALLED]: "部件已安装在其他位置",
  [ResourceErrorCode.COMPONENT_NOT_INSTALLED]: "部件未安装",
  [ResourceErrorCode.COMPONENT_LIFE_LIMIT_EXCEEDED]: "部件已超过使用寿命",
  [ResourceErrorCode.WORK_ORDER_NOT_FOUND]: "工单不存在",
  [ResourceErrorCode.WORK_ORDER_ALREADY_COMPLETED]: "工单已完成",
  [ResourceErrorCode.WORK_ORDER_ALREADY_RELEASED]: "工单已放行",
  [ResourceErrorCode.WORK_ORDER_CANNOT_BE_MODIFIED]: "工单不可修改",
  [ResourceErrorCode.TASK_NOT_FOUND]: "任务不存在",
  [ResourceErrorCode.TASK_RII_NOT_SIGNED]: "RII 任务未签字",
  [ResourceErrorCode.TASK_NOT_COMPLETED]: "任务未完成",
  [ResourceErrorCode.INVENTORY_ITEM_NOT_FOUND]: "库存项不存在",
  [ResourceErrorCode.INSUFFICIENT_STOCK]: "库存不足",
  [ResourceErrorCode.WAREHOUSE_NOT_FOUND]: "仓库不存在",
  [ResourceErrorCode.PURCHASE_REQUEST_NOT_FOUND]: "采购申请不存在",
  [ResourceErrorCode.PURCHASE_ORDER_NOT_FOUND]: "采购订单不存在",
  [ResourceErrorCode.SUPPLIER_NOT_FOUND]: "供应商不存在",
  [ResourceErrorCode.MAINTENANCE_SCHEDULE_NOT_FOUND]: "维保计划不存在",
  [ResourceErrorCode.MAINTENANCE_PROGRAM_NOT_FOUND]: "维保程序不存在",
  [ResourceErrorCode.MAINTENANCE_TRIGGER_NOT_FOUND]: "维保触发器不存在",
  [ResourceErrorCode.FLIGHT_LOG_NOT_FOUND]: "飞行记录不存在",
  [ResourceErrorCode.PILOT_REPORT_NOT_FOUND]: "故障报告不存在",
  [ResourceErrorCode.RELEASE_RECORD_NOT_FOUND]: "放行记录不存在",

  // Business
  [BusinessErrorCode.INVALID_STATE_TRANSITION]: "无效的状态转换",
  [BusinessErrorCode.OPERATION_NOT_ALLOWED]: "操作不允许",
  [BusinessErrorCode.APPROVAL_REQUIRED]: "需要审批",
  [BusinessErrorCode.ALREADY_APPROVED]: "已审批通过",
  [BusinessErrorCode.ALREADY_REJECTED]: "已驳回",
  [BusinessErrorCode.CANNOT_CANCEL]: "无法取消",
  [BusinessErrorCode.MAINTENANCE_DUE]: "维保即将到期",
  [BusinessErrorCode.MAINTENANCE_OVERDUE]: "维保已逾期",
  [BusinessErrorCode.RII_SIGNATURE_REQUIRED]: "需要检验员签字",
  [BusinessErrorCode.RELEASE_SIGNATURE_REQUIRED]: "需要放行签字",
  [BusinessErrorCode.RELEASE_ALREADY_SIGNED]: "已签署放行",
  [BusinessErrorCode.RESERVATION_FAILED]: "预留失败",
  [BusinessErrorCode.RELEASE_FAILED]: "释放失败",

  // System
  [SystemErrorCode.INTERNAL_ERROR]: "系统内部错误",
  [SystemErrorCode.DATABASE_ERROR]: "数据库错误",
  [SystemErrorCode.EXTERNAL_SERVICE_ERROR]: "外部服务错误",
  [SystemErrorCode.CONFIGURATION_ERROR]: "配置错误",
  [SystemErrorCode.RATE_LIMIT_EXCEEDED]: "请求过于频繁",
  [SystemErrorCode.SERVICE_UNAVAILABLE]: "服务暂不可用",
};

/**
 * Get error message by code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code] || "未知错误";
}
