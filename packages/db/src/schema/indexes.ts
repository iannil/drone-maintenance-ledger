/**
 * Database Indexes
 *
 * This file defines indexes for optimizing database queries.
 * In Drizzle ORM, indexes need to be added directly to the table definitions.
 *
 * This file serves as documentation of the recommended indexes
 * and provides migration SQL that can be applied to the database.
 */

/**
 * Recommended Database Indexes
 *
 * Run the following SQL statements to add indexes to your SQLite database:
 */

export const createIndexesSQL = `
-- Aircraft indexes
CREATE INDEX IF NOT EXISTS idx_aircraft_fleet_id ON aircraft(fleet_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_aircraft_is_airworthy ON aircraft(is_airworthy);

-- Component indexes
CREATE INDEX IF NOT EXISTS idx_component_type ON component(type);
CREATE INDEX IF NOT EXISTS idx_component_status ON component(status);
CREATE INDEX IF NOT EXISTS idx_component_part_number ON component(part_number);

-- Component installation indexes
CREATE INDEX IF NOT EXISTS idx_component_installation_component_id ON component_installation(component_id);
CREATE INDEX IF NOT EXISTS idx_component_installation_aircraft_id ON component_installation(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_component_installation_removed_at ON component_installation(removed_at);

-- Work order indexes
CREATE INDEX IF NOT EXISTS idx_work_order_aircraft_id ON work_order(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_work_order_status ON work_order(status);
CREATE INDEX IF NOT EXISTS idx_work_order_type ON work_order(type);
CREATE INDEX IF NOT EXISTS idx_work_order_assigned_to ON work_order(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_order_created_at ON work_order(created_at);
CREATE INDEX IF NOT EXISTS idx_work_order_schedule_id ON work_order(schedule_id);
CREATE INDEX IF NOT EXISTS idx_work_order_status_created ON work_order(status, created_at);

-- Work order task indexes
CREATE INDEX IF NOT EXISTS idx_work_order_task_work_order_id ON work_order_task(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_task_status ON work_order_task(status);

-- Work order part indexes
CREATE INDEX IF NOT EXISTS idx_work_order_part_work_order_id ON work_order_part(work_order_id);

-- Maintenance schedule indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_aircraft_id ON maintenance_schedule(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_status ON maintenance_schedule(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_trigger_id ON maintenance_schedule(trigger_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_due_date ON maintenance_schedule(due_date);

-- Flight log indexes
CREATE INDEX IF NOT EXISTS idx_flight_log_aircraft_id ON flight_log(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flight_log_pilot_id ON flight_log(pilot_id);
CREATE INDEX IF NOT EXISTS idx_flight_log_departure_time ON flight_log(departure_time);
CREATE INDEX IF NOT EXISTS idx_flight_log_flight_date ON flight_log(flight_date);
CREATE INDEX IF NOT EXISTS idx_flight_log_aircraft_date ON flight_log(aircraft_id, flight_date);

-- Pilot report indexes
CREATE INDEX IF NOT EXISTS idx_pilot_report_aircraft_id ON pilot_report(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_pilot_report_flight_log_id ON pilot_report(flight_log_id);
CREATE INDEX IF NOT EXISTS idx_pilot_report_status ON pilot_report(status);
CREATE INDEX IF NOT EXISTS idx_pilot_report_severity ON pilot_report(severity);

-- Release record indexes
CREATE INDEX IF NOT EXISTS idx_release_record_work_order_id ON release_record(work_order_id);
CREATE INDEX IF NOT EXISTS idx_release_record_aircraft_id ON release_record(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_release_record_released_by ON release_record(released_by);

-- Inventory item indexes
CREATE INDEX IF NOT EXISTS idx_inventory_item_warehouse_id ON inventory_item(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_part_number ON inventory_item(part_number);
CREATE INDEX IF NOT EXISTS idx_inventory_item_status ON inventory_item(status);
CREATE INDEX IF NOT EXISTS idx_inventory_item_category ON inventory_item(category);
CREATE INDEX IF NOT EXISTS idx_inventory_item_low_stock ON inventory_item(quantity, min_stock);

-- Inventory movement indexes
CREATE INDEX IF NOT EXISTS idx_inventory_movement_item_id ON inventory_movement(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movement_type ON inventory_movement(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movement_status ON inventory_movement(status);
CREATE INDEX IF NOT EXISTS idx_inventory_movement_created_at ON inventory_movement(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movement_from_warehouse ON inventory_movement(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movement_to_warehouse ON inventory_movement(to_warehouse_id);

-- Purchase request indexes
CREATE INDEX IF NOT EXISTS idx_purchase_request_status ON purchase_request(status);
CREATE INDEX IF NOT EXISTS idx_purchase_request_requester_id ON purchase_request(requester_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_priority ON purchase_request(priority);
CREATE INDEX IF NOT EXISTS idx_purchase_request_created_at ON purchase_request(created_at);

-- Purchase request item indexes
CREATE INDEX IF NOT EXISTS idx_purchase_request_item_request_id ON purchase_request_item(purchase_request_id);

-- Purchase order indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_status ON purchase_order(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_supplier_id ON purchase_order(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_created_at ON purchase_order(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_order_warehouse_id ON purchase_order(warehouse_id);

-- Purchase order item indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_item_order_id ON purchase_order_item(purchase_order_id);

-- Purchase receipt indexes
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_order_id ON purchase_receipt(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_receipt_warehouse_id ON purchase_receipt(warehouse_id);

-- Maintenance trigger indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_trigger_program_id ON maintenance_trigger(program_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_trigger_type ON maintenance_trigger(type);
`;

/**
 * Apply indexes to database
 * Usage: import and call this function to create all indexes
 */
export async function applyIndexes(db: { run: (sql: { sql: string }) => void }): Promise<void> {
  const statements = createIndexesSQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.startsWith("CREATE"));

  for (const statement of statements) {
    db.run({ sql: statement + ";" });
  }
}

/**
 * Index recommendations for common query patterns:
 *
 * 1. Aircraft status dashboard:
 *    - idx_aircraft_status: Filter by operational status
 *    - idx_aircraft_is_airworthy: Filter airworthy aircraft
 *
 * 2. Work order management:
 *    - idx_work_order_status: Filter by WO status
 *    - idx_work_order_assigned_to: Filter by assigned technician
 *    - idx_work_order_status_created: Sort by status then date
 *
 * 3. Flight log queries:
 *    - idx_flight_log_aircraft_date: Query flights by aircraft and date range
 *    - idx_flight_log_pilot_id: Query flights by pilot
 *
 * 4. Inventory management:
 *    - idx_inventory_item_low_stock: Find items below reorder point
 *    - idx_inventory_item_warehouse_id: Filter by warehouse
 *
 * 5. Component tracking:
 *    - idx_component_installation_removed_at: Find current installations (NULL)
 *    - idx_component_part_number: Search by part number
 *
 * 6. Maintenance scheduling:
 *    - idx_maintenance_schedule_due_date: Find upcoming/overdue maintenance
 *    - idx_maintenance_schedule_status: Filter by schedule status
 */
