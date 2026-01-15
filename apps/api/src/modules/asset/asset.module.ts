import { Module } from "@nestjs/common";

import { FleetService } from "./fleet.service";
import { FleetController } from "./fleet.controller";
import { FleetRepository } from "./repositories/fleet.repository";

import { AircraftService } from "./aircraft.service";
import { AircraftController } from "./aircraft.controller";
import { AircraftRepository } from "./repositories/aircraft.repository";

import { ComponentService } from "./component.service";
import { ComponentController } from "./component.controller";
import { ComponentRepository } from "./repositories/component.repository";

@Module({
  controllers: [FleetController, AircraftController, ComponentController],
  providers: [
    FleetService,
    FleetRepository,
    AircraftService,
    AircraftRepository,
    ComponentService,
    ComponentRepository,
  ],
  exports: [
    FleetService,
    FleetRepository,
    AircraftService,
    AircraftRepository,
    ComponentService,
    ComponentRepository,
  ],
})
export class AssetModule {}
