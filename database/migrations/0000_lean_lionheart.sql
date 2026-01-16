CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'PILOT' NOT NULL,
	"full_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "fleet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"organization" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fleet_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "aircraft" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleet_id" uuid NOT NULL,
	"registration_number" text NOT NULL,
	"serial_number" text NOT NULL,
	"model" text NOT NULL,
	"manufacturer" text NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"total_flight_hours" integer DEFAULT 0 NOT NULL,
	"total_flight_cycles" integer DEFAULT 0 NOT NULL,
	"is_airworthy" boolean DEFAULT true NOT NULL,
	"last_inspection_at" timestamp,
	"next_inspection_due" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aircraft_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_number" text NOT NULL,
	"part_number" text NOT NULL,
	"type" text NOT NULL,
	"manufacturer" text NOT NULL,
	"model" text,
	"description" text,
	"total_flight_hours" integer DEFAULT 0 NOT NULL,
	"total_flight_cycles" integer DEFAULT 0 NOT NULL,
	"battery_cycles" integer DEFAULT 0 NOT NULL,
	"is_life_limited" boolean DEFAULT false NOT NULL,
	"max_flight_hours" integer,
	"max_cycles" integer,
	"status" text DEFAULT 'NEW' NOT NULL,
	"is_airworthy" boolean DEFAULT true NOT NULL,
	"manufactured_at" timestamp,
	"purchased_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "component_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "component_installation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"location" text NOT NULL,
	"inherited_flight_hours" integer DEFAULT 0 NOT NULL,
	"inherited_cycles" integer DEFAULT 0 NOT NULL,
	"flight_hours" integer DEFAULT 0 NOT NULL,
	"cycles" integer DEFAULT 0 NOT NULL,
	"installed_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp,
	"removed_by" uuid,
	"install_notes" text,
	"remove_notes" text
);
--> statement-breakpoint
CREATE TABLE "maintenance_program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"aircraft_model" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_trigger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"interval_value" integer NOT NULL,
	"applicable_component_type" text,
	"applicable_component_location" text,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"required_role" text DEFAULT 'INSPECTOR' NOT NULL,
	"is_rii" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"trigger_id" uuid NOT NULL,
	"status" text DEFAULT 'SCHEDULED' NOT NULL,
	"due_date" timestamp,
	"due_at_value" integer,
	"last_completed_at" timestamp,
	"last_completed_at_value" integer,
	"assigned_to" uuid,
	"work_order_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"trigger_id" uuid,
	"description" text NOT NULL,
	"work_performed" text NOT NULL,
	"performed_by" uuid NOT NULL,
	"inspected_by" uuid,
	"performed_at" timestamp NOT NULL,
	"aircraft_hours_at_perform" integer,
	"aircraft_cycles_at_perform" integer,
	"parts_replaced" jsonb,
	"findings" text,
	"discrepancies" text,
	"next_due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"reason" text,
	"assigned_to" uuid,
	"assigned_at" timestamp,
	"scheduled_start" timestamp,
	"scheduled_end" timestamp,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"aircraft_hours" integer,
	"aircraft_cycles" integer,
	"completed_by" uuid,
	"completed_at" timestamp,
	"released_by" uuid,
	"released_at" timestamp,
	"completion_notes" text,
	"discrepancies" text,
	"schedule_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "work_order_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "work_order_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructions" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"is_rii" boolean DEFAULT false NOT NULL,
	"inspected_by" uuid,
	"started_at" timestamp,
	"completed_at" timestamp,
	"result" text,
	"notes" text,
	"photos" jsonb,
	"required_tools" jsonb,
	"required_parts" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_order_part" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"component_id" uuid,
	"part_number" text NOT NULL,
	"part_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit" text NOT NULL,
	"installed_location" text,
	"removed_component_id" uuid,
	"removed_serial_number" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"flight_date" timestamp NOT NULL,
	"flight_type" text DEFAULT 'OPERATION' NOT NULL,
	"departure_location" text NOT NULL,
	"departure_time" timestamp,
	"arrival_location" text,
	"arrival_time" timestamp,
	"pilot_id" uuid NOT NULL,
	"copilot_id" uuid,
	"flight_duration" integer NOT NULL,
	"flight_hours" integer NOT NULL,
	"takeoff_cycles" integer DEFAULT 1 NOT NULL,
	"landing_cycles" integer DEFAULT 1 NOT NULL,
	"mission_description" text,
	"payload_weight" integer,
	"pre_flight_check_completed" boolean DEFAULT true NOT NULL,
	"pre_flight_check_by" uuid,
	"post_flight_notes" text,
	"discrepancies" text,
	"aircraft_hours_before" integer,
	"aircraft_hours_after" integer,
	"aircraft_cycles_before" integer,
	"aircraft_cycles_after" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"flight_log_id" uuid,
	"reported_by" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"is_aog" boolean DEFAULT false NOT NULL,
	"affected_system" text,
	"affected_component" text,
	"work_order_id" uuid,
	"resolution" text,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "release_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aircraft_id" uuid NOT NULL,
	"work_order_id" uuid,
	"release_status" text DEFAULT 'FULL' NOT NULL,
	"released_by" uuid NOT NULL,
	"release_certificate_number" text,
	"conditions" text,
	"work_description" text NOT NULL,
	"limitations" text,
	"signature_hash" text,
	"is_valid" boolean DEFAULT true NOT NULL,
	"superseded_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_fleet_id_fleet_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_installation" ADD CONSTRAINT "component_installation_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_installation" ADD CONSTRAINT "component_installation_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_trigger" ADD CONSTRAINT "maintenance_trigger_program_id_maintenance_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."maintenance_program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedule" ADD CONSTRAINT "maintenance_schedule_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_schedule" ADD CONSTRAINT "maintenance_schedule_trigger_id_maintenance_trigger_id_fk" FOREIGN KEY ("trigger_id") REFERENCES "public"."maintenance_trigger"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_history" ADD CONSTRAINT "maintenance_history_inspected_by_user_id_fk" FOREIGN KEY ("inspected_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_completed_by_user_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_released_by_user_id_fk" FOREIGN KEY ("released_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_task" ADD CONSTRAINT "work_order_task_work_order_id_work_order_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_part" ADD CONSTRAINT "work_order_part_work_order_id_work_order_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_part" ADD CONSTRAINT "work_order_part_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_part" ADD CONSTRAINT "work_order_part_removed_component_id_component_id_fk" FOREIGN KEY ("removed_component_id") REFERENCES "public"."component"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_log" ADD CONSTRAINT "flight_log_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_log" ADD CONSTRAINT "flight_log_pilot_id_user_id_fk" FOREIGN KEY ("pilot_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_log" ADD CONSTRAINT "flight_log_copilot_id_user_id_fk" FOREIGN KEY ("copilot_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_log" ADD CONSTRAINT "flight_log_pre_flight_check_by_user_id_fk" FOREIGN KEY ("pre_flight_check_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_report" ADD CONSTRAINT "pilot_report_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_report" ADD CONSTRAINT "pilot_report_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_report" ADD CONSTRAINT "pilot_report_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_record" ADD CONSTRAINT "release_record_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_record" ADD CONSTRAINT "release_record_released_by_user_id_fk" FOREIGN KEY ("released_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;