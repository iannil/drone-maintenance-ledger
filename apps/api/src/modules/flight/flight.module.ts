import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { FlightLogController } from "./flight-log.controller";
import { FlightLogService } from "./flight-log.service";
import { FlightLogRepository } from "./repositories/flight-log.repository";

import { PilotReportController } from "./pilot-report.controller";
import { PilotReportService } from "./pilot-report.service";
import { PilotReportRepository } from "./repositories/pilot-report.repository";

import { ReleaseRecordController } from "./release-record.controller";
import { ReleaseRecordService } from "./release-record.service";
import { ReleaseRecordRepository } from "./repositories/release-record.repository";

/**
 * Flight Module
 *
 * Handles flight operations and technical records:
 * - Flight logs (daily flight records)
 * - Pilot reports (PIREP - issue reporting)
 * - Release records (aircraft release to service)
 */
@Module({
  imports: [ConfigModule],
  controllers: [
    FlightLogController,
    PilotReportController,
    ReleaseRecordController,
  ],
  providers: [
    // Services
    FlightLogService,
    PilotReportService,
    ReleaseRecordService,
    // Repositories
    FlightLogRepository,
    PilotReportRepository,
    ReleaseRecordRepository,
  ],
  exports: [
    FlightLogService,
    PilotReportService,
    ReleaseRecordService,
  ],
})
export class FlightModule {}
