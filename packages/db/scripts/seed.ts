/**
 * Seed script for development database
 *
 * Run: pnpm --filter @repo/db db:seed
 */

import { db } from "../src/index.js";
import * as schema from "../src/schema/index.js";
import { user, fleet, aircraft, component, maintenanceProgram } from "../src/schema/index.js";
import { hash } from "bcrypt";

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (development only)
  console.log("🧹 Cleaning existing data...");
  await db.delete(component);
  await db.delete(aircraft);
  await db.delete(fleet);
  await db.delete(user);
  await db.delete(maintenanceProgram);

  // Create users
  console.log("👤 Creating users...");
  const hashedPassword = await hash("password123", 10);

  const [adminUser] = await db
    .insert(user)
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
    .insert(user)
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

  await db.insert(user).values([
    {
      username: "pilot",
      email: "pilot@example.com",
      passwordHash: hashedPassword,
      role: "PILOT",
      fullName: "飞手张三",
      isActive: true,
    },
    {
      username: "mechanic",
      email: "mechanic@example.com",
      passwordHash: hashedPassword,
      role: "MECHANIC",
      fullName: "维修工李四",
      isActive: true,
    },
    {
      username: "inspector",
      email: "inspector@example.com",
      passwordHash: hashedPassword,
      role: "INSPECTOR",
      fullName: "检验员王五",
      isActive: true,
    },
  ]);

  // Create fleet
  console.log("✈️ Creating fleet...");
  const [demoFleet] = await db
    .insert(fleet)
    .values([
      {
        name: "演示机队",
        code: "DEMO-FLEET",
        organization: "演示公司",
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
        registrationNumber: "B-1234",
        serialNumber: "SN-001",
        model: "DJI Matrice 300 RTK",
        manufacturer: "DJI",
        fleetId: demoFleet.id,
        status: "AVAILABLE",
      },
    ])
    .returning();

  await db.insert(aircraft).values([
    {
      registrationNumber: "B-5678",
      serialNumber: "SN-002",
      model: "DJI Matrice 300 RTK",
      manufacturer: "DJI",
      fleetId: demoFleet.id,
      status: "IN_MAINTENANCE",
    },
  ]);

  // Create components
  console.log("⚙️ Creating components...");
  await db.insert(component).values([
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
      totalFlightHours: 45.5,
      totalFlightCycles: 230,
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
      totalFlightHours: 45.5,
      totalFlightCycles: 230,
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
      totalFlightHours: 45.5,
      totalFlightCycles: 230,
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
      totalFlightHours: 45.5,
      totalFlightCycles: 230,
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
      totalFlightHours: 25.0,
      totalFlightCycles: 45,
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
      totalFlightHours: 32.0,
      totalFlightCycles: 67,
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
      totalFlightHours: 120.0,
      totalFlightCycles: 450,
      maxFlightHours: 500,
      isLifeLimited: true,
    },
  ]);

  // Create maintenance programs
  console.log("📋 Creating maintenance programs...");
  await db.insert(maintenanceProgram).values([
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
}

main().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
