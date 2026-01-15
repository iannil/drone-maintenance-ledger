/**
 * Component Installation Schema
 *
 * Tracks where a component is installed and when
 * This enables component history to be independent of aircraft
 */

import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { component } from "./component.js";
import { aircraft } from "./aircraft.js";

/**
 * Component installations table
 *
 * Records the installation history of components on aircraft.
 * When a component is moved from Aircraft A to Aircraft B:
 * 1. The current installation record is closed (removedAt set)
 * 2. A new installation record is created
 * 3. The component's cumulative values (totalFlightHours, etc.) transfer with it
 */
export const componentInstallation = pgTable("component_installation", {
  id: uuid("id").primaryKey().defaultRandom(),
  componentId: uuid("component_id")
    .notNull()
    .references(() => component.id, { onDelete: "restrict" }),
  aircraftId: uuid("aircraft_id")
    .notNull()
    .references(() => aircraft.id, { onDelete: "restrict" }),

  // Installation location on aircraft (e.g., "front-left-motor", "battery-bay-1")
  location: text("location").notNull(),

  // Inherited values from component at time of installation
  // This is important for tracking component history across aircraft
  inheritedFlightHours: integer("inherited_flight_hours").notNull().default(0),
  inheritedCycles: integer("inherited_cycles").notNull().default(0),

  // Accumulated during this installation period
  flightHours: integer("flight_hours").notNull().default(0),
  cycles: integer("cycles").notNull().default(0),

  // Timestamps
  installedAt: timestamp("installed_at").notNull().defaultNow(),
  removedAt: timestamp("removed_at"), // NULL means currently installed
  removedBy: uuid("removed_by"), // User who removed the component
  installNotes: text("install_notes"),
  removeNotes: text("remove_notes"),
});

export type ComponentInstallation = typeof componentInstallation.$inferSelect;
export type NewComponentInstallation = typeof componentInstallation.$inferInsert;
