/**
 * Supplier Schema
 *
 * Represents suppliers/vendors for parts and components
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Supplier status
 */
export const SupplierStatusEnum = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  BLACKLISTED: "BLACKLISTED",
} as const;

export type SupplierStatus = (typeof SupplierStatusEnum)[keyof typeof SupplierStatusEnum];

/**
 * Supplier rating
 */
export const SupplierRatingEnum = {
  A: "A", // Excellent
  B: "B", // Good
  C: "C", // Average
  D: "D", // Below average
  F: "F", // Poor
} as const;

export type SupplierRating = (typeof SupplierRatingEnum)[keyof typeof SupplierRatingEnum];

/**
 * Suppliers table
 */
export const supplier = sqliteTable("supplier", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(), // Supplier code (e.g., "SUP-001")
  name: text("name").notNull(),
  shortName: text("short_name"), // Short name/alias

  // Contact information
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  website: text("website"),

  // Address
  address: text("address"),
  city: text("city"),
  province: text("province"),
  country: text("country").default("中国"),
  postalCode: text("postal_code"),

  // Business information
  businessLicense: text("business_license"), // Business license number
  taxId: text("tax_id"), // Tax ID
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),

  // Categories and products
  categories: text("categories"), // JSON array of product categories
  mainProducts: text("main_products"), // Description of main products

  // Rating and status
  status: text("status").notNull().default(SupplierStatusEnum.ACTIVE),
  rating: text("rating").default(SupplierRatingEnum.B),

  // Payment terms
  paymentTerms: text("payment_terms"), // e.g., "Net 30", "COD"
  creditLimit: integer("credit_limit"), // Credit limit in cents

  // Performance metrics
  leadTimeDays: integer("lead_time_days"), // Average lead time
  onTimeDeliveryRate: integer("on_time_delivery_rate"), // Percentage (0-100)
  qualityScore: integer("quality_score"), // Quality score (0-100)
  totalOrders: integer("total_orders").default(0),
  totalAmount: integer("total_amount").default(0), // Total purchase amount in cents

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
});

export type Supplier = typeof supplier.$inferSelect;
export type NewSupplier = typeof supplier.$inferInsert;
