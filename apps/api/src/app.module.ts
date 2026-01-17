import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { AssetModule } from "./modules/asset/asset.module";
import { FlightModule } from "./modules/flight/flight.module";
import { MaintenanceModule } from "./modules/maintenance/maintenance.module";
import { StatsModule } from "./modules/stats/stats.module";
import { InventoryModule } from "./modules/inventory/inventory.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env.local", "../../.env"],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    AssetModule,
    FlightModule,
    MaintenanceModule,
    StatsModule,
    InventoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
