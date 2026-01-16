import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  Inject,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {
  ComponentService,
  CreateComponentDto,
  UpdateComponentDto,
  InstallComponentDto,
  RemoveComponentDto,
} from "./component.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

/**
 * Component controller
 *
 * Handles component CRUD and installation operations
 */
@Controller("components")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ComponentController {
  private componentService: ComponentService;

  constructor(@Inject(ComponentService) componentService: ComponentService) {
    this.componentService = componentService;
  }

  /**
   * Get component by ID
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.componentService.findById(id);
  }

  /**
   * Get component by serial number
   */
  @Get("serial/:serialNumber")
  async getBySerial(@Param("serialNumber") serialNumber: string) {
    return this.componentService.findBySerialNumber(serialNumber);
  }

  /**
   * List all components
   */
  @Get()
  async list(
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 50,
    @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
    @Query("aircraftId") aircraftId?: string,
  ) {
    if (aircraftId) {
      return this.componentService.findInstalledOnAircraft(aircraftId);
    }
    return this.componentService.list(limit, offset);
  }

  /**
   * Get components due for maintenance
   */
  @Get("maintenance/due")
  async getDueForMaintenance() {
    return this.componentService.findDueForMaintenance();
  }

  /**
   * Create new component
   */
  @Post()
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async create(@Body() dto: CreateComponentDto) {
    return this.componentService.create(dto);
  }

  /**
   * Install component on aircraft
   */
  @Post("install")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async install(@Body() dto: InstallComponentDto) {
    return this.componentService.install(dto);
  }

  /**
   * Remove component from aircraft
   */
  @Post("remove")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async remove(@Body() dto: RemoveComponentDto) {
    return this.componentService.remove(dto);
  }

  /**
   * Update component
   */
  @Put(":id")
  @Roles("ADMIN", "MANAGER", "MECHANIC")
  async update(@Param("id") id: string, @Body() dto: UpdateComponentDto) {
    return this.componentService.update(id, dto);
  }

  /**
   * Delete component
   */
  @Delete(":id")
  @Roles("ADMIN", "MANAGER")
  async delete(@Param("id") id: string) {
    await this.componentService.delete(id);
    return { success: true };
  }
}
