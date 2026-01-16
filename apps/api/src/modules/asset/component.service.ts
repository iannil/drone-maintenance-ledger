import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";

import type { Component, ComponentInstallation, NewComponent } from "@repo/db";
import { ComponentRepository } from "./repositories/component.repository";

/**
 * DTOs for component operations
 */
export interface CreateComponentDto {
  serialNumber: string;
  partNumber: string;
  type: Component["type"];
  manufacturer: string;
  model?: string;
  description?: string;
  isLifeLimited?: boolean;
  maxFlightHours?: number;
  maxCycles?: number;
  manufacturedAt?: Date;
  purchasedAt?: Date;
}

export interface UpdateComponentDto {
  partNumber?: string;
  type?: Component["type"];
  manufacturer?: string;
  model?: string;
  description?: string;
  isLifeLimited?: boolean;
  maxFlightHours?: number;
  maxCycles?: number;
  status?: Component["status"];
  isAirworthy?: boolean;
}

export interface InstallComponentDto {
  componentId: string;
  aircraftId: string;
  location: string;
  installNotes?: string;
}

export interface RemoveComponentDto {
  componentId: string;
  removeNotes?: string;
}

/**
 * Component service
 *
 * Handles component business logic with history tracking
 * IMPORTANT: Component history follows the component, not the aircraft
 */
@Injectable()
export class ComponentService {
  constructor(private readonly componentRepository: ComponentRepository) {}

  /**
   * Find component by ID
   */
  async findById(id: string): Promise<Component | null> {
    return this.componentRepository.findById(id);
  }

  /**
   * Find component by serial number with installation info
   */
  async findBySerialNumber(serialNumber: string) {
    return this.componentRepository.findBySerialWithInstallation(serialNumber);
  }

  /**
   * List components
   */
  async list(limit: number = 50, offset: number = 0): Promise<Component[]> {
    return this.componentRepository.list(limit, offset);
  }

  /**
   * Find components installed on an aircraft
   */
  async findInstalledOnAircraft(aircraftId: string) {
    return this.componentRepository.findInstalledOnAircraft(aircraftId);
  }

  /**
   * Create new component
   */
  async create(dto: CreateComponentDto): Promise<Component> {
    // Check if serial number already exists
    const existing = await this.componentRepository.findBySerialNumber(dto.serialNumber);
    if (existing) {
      throw new ConflictException("Component serial number already exists");
    }

    return this.componentRepository.create({
      ...dto,
      status: "NEW",
      isAirworthy: true,
      totalFlightHours: 0,
      totalFlightCycles: 0,
      batteryCycles: 0,
    });
  }

  /**
   * Update component
   */
  async update(id: string, dto: UpdateComponentDto): Promise<Component> {
    const existing = await this.componentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Component not found");
    }

    return this.componentRepository.update(id, dto);
  }

  /**
   * Delete component
   */
  async delete(id: string): Promise<void> {
    const existing = await this.componentRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Component not found");
    }

    await this.componentRepository.delete(id);
  }

  /**
   * Install component on aircraft
   *
   * This is the CORE of component history tracking:
   * 1. Validate component is airworthy
   * 2. If component is currently installed elsewhere, remove it first
   * 3. Create new installation record
   * 4. Update component status
   *
   * IMPORTANT: Component's cumulative values (totalFlightHours, etc.) stay with
   * the component. The installation record snapshots these values at install time
   * for later analysis of usage per installation period.
   */
  async install(dto: InstallComponentDto) {
    const componentData = await this.componentRepository.findById(dto.componentId);
    if (!componentData) {
      throw new NotFoundException("Component not found");
    }

    // Check if component is airworthy
    if (!componentData.isAirworthy) {
      throw new ConflictException("Cannot install non-airworthy component");
    }

    // Check if component is life limited and exceeded limits
    if (componentData.isLifeLimited) {
      if (
        componentData.maxFlightHours &&
        componentData.totalFlightHours >= componentData.maxFlightHours
      ) {
        throw new ConflictException(
          `Component has exceeded flight hour limit (${componentData.totalFlightHours}/${componentData.maxFlightHours})`,
        );
      }
      if (
        componentData.maxCycles &&
        componentData.totalFlightCycles >= componentData.maxCycles
      ) {
        throw new ConflictException(
          `Component has exceeded cycle limit (${componentData.totalFlightCycles}/${componentData.maxCycles})`,
        );
      }
    }

    // Check if component is currently installed somewhere - if so, remove it first
    const currentInstallation = await this.componentRepository.getCurrentInstallation(
      dto.componentId,
    );
    if (currentInstallation) {
      // Auto-remove from current aircraft
      await this.componentRepository.remove(
        dto.componentId,
        `Auto-removed during installation to aircraft ${dto.aircraftId}`,
      );
    }

    // Create the new installation
    await this.componentRepository.install(
      dto.componentId,
      dto.aircraftId,
      dto.location,
      dto.installNotes,
    );

    // Update component status
    await this.componentRepository.update(dto.componentId, {
      status: "INSTALLED",
      currentAircraftId: dto.aircraftId,
      installPosition: dto.location,
    });

    return {
      componentId: dto.componentId,
      aircraftId: dto.aircraftId,
      location: dto.location,
      message: "Component installed successfully",
    };
  }

  /**
   * Remove component from aircraft
   *
   * 1. Close the installation record
   * 2. Update component status to REMOVED
   * 3. Clear current aircraft association
   */
  async remove(dto: RemoveComponentDto) {
    const componentData = await this.componentRepository.findById(dto.componentId);
    if (!componentData) {
      throw new NotFoundException("Component not found");
    }

    // Check if component is actually installed
    if (componentData.status !== "INSTALLED") {
      throw new ConflictException("Component is not currently installed");
    }

    // Close the installation record
    await this.componentRepository.remove(dto.componentId, dto.removeNotes);

    // Update component status
    await this.componentRepository.update(dto.componentId, {
      status: "REMOVED",
      currentAircraftId: null,
      installPosition: null,
    });

    return {
      componentId: dto.componentId,
      message: "Component removed successfully",
      previousAircraftId: componentData.currentAircraftId,
    };
  }

  /**
   * Find components due for maintenance
   */
  async findDueForMaintenance() {
    return this.componentRepository.findDueForMaintenance();
  }

  /**
   * Update component lifecycle metrics
   * Called after flight to update hours/cycles
   */
  async updateLifecycleMetrics(
    id: string,
    flightHours: number,
    flightCycles: number,
    batteryCycles?: number,
  ): Promise<Component> {
    return this.componentRepository.updateLifecycleMetrics(id, flightHours, flightCycles, batteryCycles);
  }
}

// Re-export types for convenience
export type { Component, ComponentInstallation, NewComponent };
