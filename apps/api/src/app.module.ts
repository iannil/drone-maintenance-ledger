import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { AssetModule } from "./modules/asset/asset.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    AssetModule,

    // TODO: Add more modules as we build them
    // FlightModule,
    // MaintenanceModule,
    // PlanningModule,
    // InventoryModule,
    // DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
