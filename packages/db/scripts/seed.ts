/**
 * Seed script for development database
 *
 * Run: pnpm --filter @repo/db db:seed
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/schema/index.js";
import { users, fleets, aircraft, components, maintenancePrograms } from "../src/schema/index.js";
import { hash } from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://localhost:5432/drone_ledger";

async function main() {
  console.log("🌱 Starting database seed...");

  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });

  // Clean existing data (development only)
  console.log("🧹 Cleaning existing data...");
  await db.delete(components);
  await db.delete(aircraft);
  await db.delete(fleets);
  await db.delete(users);
  await db.delete(maintenancePrograms);

  // Create users
  console.log("👤 Creating users...");
  const hashedPassword = await hash("password123", 10);

  const [adminUser] = await db
    .insert(users)
    .values([
      {
        username: "admin",
        email: "admin@example.com",
        passwordHash: hashedPassword,
        role: "ADMIN",
        fullName: "系统管理员",
        isActive: true,
      },
    ])
    .returning();

  const [managerUser] = await db
    .insert(users)
    .values([
      {
        username: "manager",
        email: "manager@example.com",
        passwordHash: hashedPassword,
        role: "MANAGER",
        fullName: "机队经理",
        isActive: true,
      },
    ])
    .returning();

  const [pilotUser] = await db
    .insert(users)
    .values([
      {
        username: "pilot",
        email: "pilot@example.com",
        passwordHash: hashedPassword,
        role: "PILOT",
        fullName: "飞手张三",
        isActive: true,
      },
    ])
    .returning();

  const [mechanicUser] = await db
    .insert(users)
    .values([
      {
        username: "mechanic",
        email: "mechanic@example.com",
        passwordHash: hashedPassword,
        role: "MECHANIC",
        fullName: "维修工李四",
        isActive: true,
      },
    ])
    .returning();

  const [inspectorUser] = await db
    .insert(users)
    .values([
      {
        username: "inspector",
        email: "inspector@example.com",
        passwordHash: hashedPassword,
        role: "INSPECTOR",
        fullName: "检验员王五",
        isActive: true,
      },
    ])
    .returning();

  // Create fleet
  console.log("✈️ Creating fleet...");
  const [demoFleet] = await db
    .insert(fleets)
    .values([
      {
        name: "演示机队",
        code: "DEMO-FLEET",
        organizationId: "org-001",
        description: "用于演示的机队",
      },
    ])
    .returning();

  // Create aircraft
  console.log("🛩️ Creating aircraft...");
  const [aircraft1] = await db
    .insert(aircraft)
    .values([
      {
        registrationCode: "B-1234",
        serialNumber: "SN-001",
        model: "DJI Matrice 300 RTK",
        manufacturer: "DJI",
        fleetId: demoFleet.id,
        status: "SERVICEABLE",
        productionDate: new Date("2023-01-01"),
      },
    ])
    .returning();

  const [aircraft2] = await db
    .insert(aircraft)
    .values([
      {
        registrationCode: "B-5678",
        serialNumber: "SN-002",
        model: "DJI Matrice 300 RTK",
        manufacturer: "DJI",
        fleetId: demoFleet.id,
        status: "MAINTENANCE",
        productionDate: new Date("2023-03-01"),
      },
    ])
    .returning();

  // Create components
  console.log("⚙️ Creating components...");
  await db.insert(components).values([
    // Aircraft 1 components
    {
      serialNumber: "MOTOR-001-LF",
      partNumber: "PM300-MOTOR-2101",
      name: "左前电机",
      type: "MOTOR",
      manufacturer: "DJI",
      status: "INSTALLED",
      currentAircraftId: aircraft1.id,
      installPosition: "LF", // Left Front
      flightHours: 45.5,
      cycleCount: 230,
    },
    {
      serialNumber: "MOTOR-002-RF",
      partNumber: "PM300-MOTOR-2101",
      name: "右前电机",
      type: "MOTOR",
      manufacturer: "DJI",
      status: "INSTALLED",
      currentAircraftId: aircraft1.id,
      installPosition: "RF", // Right Front
      flightHours: 45.5,
      cycleCount: 230,
    },
    {
      serialNumber: "MOTOR-003-LR",
      partNumber: "PM300-MOTOR-2101",
      name: "左后电机",
      type: "MOTOR",
      manufacturer: "DJI",
      status: "INSTALLED",
      currentAircraftId: aircraft1.id,
      installPosition: "LR", // Left Rear
      flightHours: 45.5,
      cycleCount: 230,
    },
    {
      serialNumber: "MOTOR-004-RR",
      partNumber: "PM300-MOTOR-2101",
      name: "右后电机",
      type: "MOTOR",
      manufacturer: "DJI",
      status: "INSTALLED",
      currentAircraftId: aircraft1.id,
      installPosition: "RR", // Right Rear
      flightHours: 45.5,
      cycleCount: 230,
    },
    {
      serialNumber: "BATT-001",
      partNumber: "PM300-BATT-65",
      name: "智能飞行电池",
      type: "BATTERY",
      manufacturer: "DJI",
      status: "INSTALLED",
      currentAircraftId: aircraft1.id,
      installPosition: "BAY-1",
      flightHours: 25.0,
      cycleCount: 45,
    },
    {
      serialNumber: "BATT-002",
      partNumber: "PM300-BATT-65",
      name: "智能飞行电池",
      type: "BATTERY",
      manufacturer: "DJI",
      status: "INSTALLED",
      currentAircraftId: aircraft1.id,
      installPosition: "BAY-2",
      flightHours: 32.0,
      cycleCount: 67,
    },
    // Removed component (in inventory)
    {
      serialNumber: "PROP-REMOVED-001",
      partNumber: "PM300-PROP-21",
      name: "桨叶 (已拆下)",
      type: "PROPELLER",
      manufacturer: "DJI",
      status: "REMOVED",
      currentAircraftId: null,
      flightHours: 120.0,
      cycleCount: 450,
      lifeLimitHours: 500,
      isLifeLimitedPart: true,
    },
  ]);

  // Create maintenance programs
  console.log("📋 Creating maintenance programs...");
  await db.insert(maintenancePrograms).values([
    {
      name: "50小时定检",
      code: "M300-50H",
      description: "每50飞行小时进行一次定期检查",
      aircraftModel: "DJI Matrice 300 RTK",
      isActive: true,
    },
    {
      name: "180天日历检",
      code: "M300-180D",
      description: "每180天进行一次日历检查",
      aircraftModel: "DJI Matrice 300 RTK",
      isActive: true,
    },
    {
      name: "电池更换检查",
      code: "BATT-300-CYC",
      description: "电池充放电循环达到300次时需更换",
      aircraftModel: "DJI Matrice 300 RTK",
      isActive: true,
    },
  ]);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📝 Test accounts:");
  console.log("  - admin / password123 (管理员)");
  console.log("  - manager / password123 (机队经理)");
  console.log("  - pilot / password123 (飞手)");
  console.log("  - mechanic / password123 (维修工)");
  console.log("  - inspector / password123 (检验员)");

  await client.end();
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
