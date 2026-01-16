CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'PILOT' NOT NULL,
	`full_name` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `fleet` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`organization` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fleet_code_unique` ON `fleet` (`code`);--> statement-breakpoint
CREATE TABLE `aircraft` (
	`id` text PRIMARY KEY NOT NULL,
	`fleet_id` text NOT NULL,
	`registration_number` text NOT NULL,
	`serial_number` text NOT NULL,
	`model` text NOT NULL,
	`manufacturer` text NOT NULL,
	`status` text DEFAULT 'AVAILABLE' NOT NULL,
	`total_flight_hours` integer DEFAULT 0 NOT NULL,
	`total_flight_cycles` integer DEFAULT 0 NOT NULL,
	`is_airworthy` integer DEFAULT true NOT NULL,
	`last_inspection_at` integer,
	`next_inspection_due` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`fleet_id`) REFERENCES `fleet`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aircraft_registration_number_unique` ON `aircraft` (`registration_number`);--> statement-breakpoint
CREATE TABLE `component` (
	`id` text PRIMARY KEY NOT NULL,
	`serial_number` text NOT NULL,
	`part_number` text NOT NULL,
	`type` text NOT NULL,
	`manufacturer` text NOT NULL,
	`model` text,
	`description` text,
	`total_flight_hours` integer DEFAULT 0 NOT NULL,
	`total_flight_cycles` integer DEFAULT 0 NOT NULL,
	`battery_cycles` integer DEFAULT 0 NOT NULL,
	`is_life_limited` integer DEFAULT false NOT NULL,
	`max_flight_hours` integer,
	`max_cycles` integer,
	`status` text DEFAULT 'NEW' NOT NULL,
	`is_airworthy` integer DEFAULT true NOT NULL,
	`manufactured_at` integer,
	`purchased_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `component_serial_number_unique` ON `component` (`serial_number`);--> statement-breakpoint
CREATE TABLE `component_installation` (
	`id` text PRIMARY KEY NOT NULL,
	`component_id` text NOT NULL,
	`aircraft_id` text NOT NULL,
	`location` text NOT NULL,
	`inherited_flight_hours` integer DEFAULT 0 NOT NULL,
	`inherited_cycles` integer DEFAULT 0 NOT NULL,
	`flight_hours` integer DEFAULT 0 NOT NULL,
	`cycles` integer DEFAULT 0 NOT NULL,
	`installed_at` integer NOT NULL,
	`removed_at` integer,
	`removed_by` text,
	`install_notes` text,
	`remove_notes` text,
	FOREIGN KEY (`component_id`) REFERENCES `component`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `maintenance_program` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`aircraft_model` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `maintenance_trigger` (
	`id` text PRIMARY KEY NOT NULL,
	`program_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`interval_value` integer NOT NULL,
	`applicable_component_type` text,
	`applicable_component_location` text,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`required_role` text DEFAULT 'INSPECTOR' NOT NULL,
	`is_rii` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`program_id`) REFERENCES `maintenance_program`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `maintenance_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`aircraft_id` text NOT NULL,
	`trigger_id` text NOT NULL,
	`status` text DEFAULT 'SCHEDULED' NOT NULL,
	`due_date` integer,
	`due_at_value` integer,
	`last_completed_at` integer,
	`last_completed_at_value` integer,
	`assigned_to` text,
	`work_order_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`trigger_id`) REFERENCES `maintenance_trigger`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `maintenance_history` (
	`id` text PRIMARY KEY NOT NULL,
	`aircraft_id` text NOT NULL,
	`trigger_id` text,
	`description` text NOT NULL,
	`work_performed` text NOT NULL,
	`performed_by` text NOT NULL,
	`inspected_by` text,
	`performed_at` integer NOT NULL,
	`aircraft_hours_at_perform` integer,
	`aircraft_cycles_at_perform` integer,
	`parts_replaced` text,
	`findings` text,
	`discrepancies` text,
	`next_due_date` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`performed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`inspected_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `work_order` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`aircraft_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`reason` text,
	`assigned_to` text,
	`assigned_at` integer,
	`scheduled_start` integer,
	`scheduled_end` integer,
	`actual_start` integer,
	`actual_end` integer,
	`aircraft_hours` integer,
	`aircraft_cycles` integer,
	`completed_by` text,
	`completed_at` integer,
	`released_by` text,
	`released_at` integer,
	`completion_notes` text,
	`discrepancies` text,
	`schedule_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`completed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`released_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_order_order_number_unique` ON `work_order` (`order_number`);--> statement-breakpoint
CREATE TABLE `work_order_task` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`instructions` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`is_rii` integer DEFAULT false NOT NULL,
	`inspected_by` text,
	`started_at` integer,
	`completed_at` integer,
	`result` text,
	`notes` text,
	`photos` text,
	`required_tools` text,
	`required_parts` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_order`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `work_order_part` (
	`id` text PRIMARY KEY NOT NULL,
	`work_order_id` text NOT NULL,
	`component_id` text,
	`part_number` text NOT NULL,
	`part_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit` text NOT NULL,
	`installed_location` text,
	`removed_component_id` text,
	`removed_serial_number` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`work_order_id`) REFERENCES `work_order`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`component_id`) REFERENCES `component`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`removed_component_id`) REFERENCES `component`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `flight_log` (
	`id` text PRIMARY KEY NOT NULL,
	`aircraft_id` text NOT NULL,
	`flight_date` integer NOT NULL,
	`flight_type` text DEFAULT 'OPERATION' NOT NULL,
	`departure_location` text NOT NULL,
	`departure_time` integer,
	`arrival_location` text,
	`arrival_time` integer,
	`pilot_id` text NOT NULL,
	`copilot_id` text,
	`flight_duration` integer NOT NULL,
	`flight_hours` integer NOT NULL,
	`takeoff_cycles` integer DEFAULT 1 NOT NULL,
	`landing_cycles` integer DEFAULT 1 NOT NULL,
	`mission_description` text,
	`payload_weight` integer,
	`pre_flight_check_completed` integer DEFAULT true NOT NULL,
	`pre_flight_check_by` text,
	`post_flight_notes` text,
	`discrepancies` text,
	`aircraft_hours_before` integer,
	`aircraft_hours_after` integer,
	`aircraft_cycles_before` integer,
	`aircraft_cycles_after` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`pilot_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`copilot_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`pre_flight_check_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pilot_report` (
	`id` text PRIMARY KEY NOT NULL,
	`aircraft_id` text NOT NULL,
	`flight_log_id` text,
	`reported_by` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`is_aog` integer DEFAULT false NOT NULL,
	`affected_system` text,
	`affected_component` text,
	`work_order_id` text,
	`resolution` text,
	`resolved_at` integer,
	`resolved_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`reported_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`resolved_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `release_record` (
	`id` text PRIMARY KEY NOT NULL,
	`aircraft_id` text NOT NULL,
	`work_order_id` text,
	`release_status` text DEFAULT 'FULL' NOT NULL,
	`released_by` text NOT NULL,
	`release_certificate_number` text,
	`conditions` text,
	`work_description` text NOT NULL,
	`limitations` text,
	`signature_hash` text,
	`is_valid` integer DEFAULT true NOT NULL,
	`superseded_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`released_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
