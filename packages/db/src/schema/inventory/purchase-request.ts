/**
 * Purchase Request Schema
 *
 * Represents internal purchase requests before becoming purchase orders
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../core/user";

/**
 * Purchase request priority
 */
export const PurchaseRequestPriorityEnum = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type PurchaseRequestPriority = (typeof PurchaseRequestPriorityEnum)[keyof typeof PurchaseRequestPriorityEnum];

/**
 * Purchase request status
 */
export const PurchaseRequestStatusEnum = {
  DRAFT: "DRAFT",         // 草稿
  SUBMITTED: "SUBMITTED", // 已提交
  APPROVED: "APPROVED",   // 已批准
  REJECTED: "REJECTED",   // 已拒绝
  ORDERED: "ORDERED",     // 已下单
  CANCELLED: "CANCELLED", // 已取消
} as const;

export type PurchaseRequestStatus = (typeof PurchaseRequestStatusEnum)[keyof typeof PurchaseRequestStatusEnum];

/**
 * Purchase requests table
 */
export const purchaseRequest = sqliteTable("purchase_request", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  requestNumber: text("request_number").notNull().unique(), // PR number (e.g., "PR-2026-0001")
  title: text("title").notNull(),
  description: text("description"),

  // Status and priority
  status: text("status").notNull().default(PurchaseRequestStatusEnum.DRAFT),
  priority: text("priority").notNull().default(PurchaseRequestPriorityEnum.NORMAL),

  // Requester
  requesterId: text("requester_id").references(() => user.id),
  department: text("department"),

  // Dates
  requiredDate: integer("required_date"), // When items are needed
  submittedAt: integer("submitted_at"),

  // Approval
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: integer("approved_at"),
  rejectedBy: text("rejected_by").references(() => user.id),
  rejectedAt: integer("rejected_at"),
  rejectionReason: text("rejection_reason"),

  // Budget
  estimatedTotal: integer("estimated_total"), // Estimated total in cents
  budgetCode: text("budget_code"),

  // Reference
  referenceType: text("reference_type"), // WO, etc.
  referenceId: text("reference_id"),
  referenceNumber: text("reference_number"),

  // Notes
  notes: text("notes"),
  internalNotes: text("internal_notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PurchaseRequest = typeof purchaseRequest.$inferSelect;
export type NewPurchaseRequest = typeof purchaseRequest.$inferInsert;

/**
 * Purchase request items table
 */
export const purchaseRequestItem = sqliteTable("purchase_request_item", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  purchaseRequestId: text("purchase_request_id").notNull().references(() => purchaseRequest.id),

  // Item details
  partNumber: text("part_number").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  specification: text("specification"),

  // Quantity
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull().default("个"),

  // Pricing
  estimatedUnitPrice: integer("estimated_unit_price"), // in cents
  estimatedTotal: integer("estimated_total"), // in cents

  // Preference
  preferredSupplierId: text("preferred_supplier_id"),
  preferredSupplierName: text("preferred_supplier_name"),

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PurchaseRequestItem = typeof purchaseRequestItem.$inferSelect;
export type NewPurchaseRequestItem = typeof purchaseRequestItem.$inferInsert;
