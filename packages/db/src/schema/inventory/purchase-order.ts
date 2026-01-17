/**
 * Purchase Order Schema
 *
 * Represents purchase orders to suppliers
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { supplier } from "./supplier";
import { user } from "../core/user";
import { purchaseRequest } from "./purchase-request";
import { warehouse } from "./warehouse";

/**
 * Purchase order status
 */
export const PurchaseOrderStatusEnum = {
  DRAFT: "DRAFT",               // 草稿
  PENDING_APPROVAL: "PENDING_APPROVAL", // 待审批
  APPROVED: "APPROVED",         // 已审批
  SENT: "SENT",                 // 已发送给供应商
  CONFIRMED: "CONFIRMED",       // 供应商已确认
  PARTIAL_RECEIVED: "PARTIAL_RECEIVED", // 部分收货
  RECEIVED: "RECEIVED",         // 已收货
  COMPLETED: "COMPLETED",       // 已完成
  CANCELLED: "CANCELLED",       // 已取消
} as const;

export type PurchaseOrderStatus = (typeof PurchaseOrderStatusEnum)[keyof typeof PurchaseOrderStatusEnum];

/**
 * Purchase orders table
 */
export const purchaseOrder = sqliteTable("purchase_order", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(), // PO number (e.g., "PO-2026-0001")
  title: text("title").notNull(),

  // Status
  status: text("status").notNull().default(PurchaseOrderStatusEnum.DRAFT),

  // Supplier
  supplierId: text("supplier_id").references(() => supplier.id),
  supplierName: text("supplier_name"),
  supplierContact: text("supplier_contact"),

  // Warehouse for delivery
  warehouseId: text("warehouse_id").references(() => warehouse.id),
  deliveryAddress: text("delivery_address"),

  // Source
  purchaseRequestId: text("purchase_request_id").references(() => purchaseRequest.id),

  // Creator and approver
  createdBy: text("created_by").references(() => user.id),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: integer("approved_at"),

  // Dates
  orderDate: integer("order_date"),
  expectedDeliveryDate: integer("expected_delivery_date"),
  actualDeliveryDate: integer("actual_delivery_date"),

  // Financial
  subtotal: integer("subtotal"), // Subtotal in cents
  taxAmount: integer("tax_amount"), // Tax amount in cents
  shippingCost: integer("shipping_cost"), // Shipping cost in cents
  discount: integer("discount"), // Discount in cents
  totalAmount: integer("total_amount"), // Total in cents
  currency: text("currency").default("CNY"),

  // Payment
  paymentTerms: text("payment_terms"),
  paymentStatus: text("payment_status").default("UNPAID"), // UNPAID, PARTIAL, PAID

  // Shipping
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),

  // Notes
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  internalNotes: text("internal_notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PurchaseOrder = typeof purchaseOrder.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrder.$inferInsert;

/**
 * Purchase order items table
 */
export const purchaseOrderItem = sqliteTable("purchase_order_item", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrder.id),

  // Item details
  partNumber: text("part_number").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  specification: text("specification"),

  // Quantity
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull().default("个"),
  receivedQuantity: integer("received_quantity").default(0),

  // Pricing
  unitPrice: integer("unit_price").notNull(), // in cents
  taxRate: integer("tax_rate").default(0), // Percentage * 100 (e.g., 1300 = 13%)
  totalPrice: integer("total_price"), // in cents

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PurchaseOrderItem = typeof purchaseOrderItem.$inferSelect;
export type NewPurchaseOrderItem = typeof purchaseOrderItem.$inferInsert;

/**
 * Purchase receipt table - for recording received goods
 */
export const purchaseReceipt = sqliteTable("purchase_receipt", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  receiptNumber: text("receipt_number").notNull().unique(), // GR number
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrder.id),

  // Receiver
  receivedBy: text("received_by").references(() => user.id),
  receivedAt: integer("received_at").notNull().$defaultFn(() => Date.now()),

  // Warehouse
  warehouseId: text("warehouse_id").references(() => warehouse.id),

  // Inspection
  inspectedBy: text("inspected_by").references(() => user.id),
  inspectedAt: integer("inspected_at"),
  inspectionNotes: text("inspection_notes"),
  isInspectionPassed: integer("is_inspection_passed", { mode: "boolean" }).default(true),

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PurchaseReceipt = typeof purchaseReceipt.$inferSelect;
export type NewPurchaseReceipt = typeof purchaseReceipt.$inferInsert;

/**
 * Purchase receipt items table
 */
export const purchaseReceiptItem = sqliteTable("purchase_receipt_item", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  purchaseReceiptId: text("purchase_receipt_id").notNull().references(() => purchaseReceipt.id),
  purchaseOrderItemId: text("purchase_order_item_id").references(() => purchaseOrderItem.id),

  // Item details
  partNumber: text("part_number").notNull(),
  name: text("name").notNull(),

  // Quantity
  receivedQuantity: integer("received_quantity").notNull(),
  acceptedQuantity: integer("accepted_quantity").notNull(),
  rejectedQuantity: integer("rejected_quantity").default(0),
  unit: text("unit").notNull().default("个"),

  // Tracking
  batchNumber: text("batch_number"),
  serialNumbers: text("serial_numbers"), // JSON array

  // Storage location
  location: text("location"),
  binNumber: text("bin_number"),

  // Quality
  qualityStatus: text("quality_status").default("PASSED"), // PASSED, FAILED, PENDING
  rejectionReason: text("rejection_reason"),

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type PurchaseReceiptItem = typeof purchaseReceiptItem.$inferSelect;
export type NewPurchaseReceiptItem = typeof purchaseReceiptItem.$inferInsert;
