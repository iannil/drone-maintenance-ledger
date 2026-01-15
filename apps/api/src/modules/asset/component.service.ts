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
   * 1. Close any existing installation record
   * 2. Create new installation record with inherited metrics
   * 3. Component's cumulative values stay with the component
   */
  async install(dto: InstallComponentDto) {
    const component = await this.componentRepository.findById(dto.componentId);
    if (!component) {
      throw new NotFoundException("Component not found");
    }

    // Check if component is airworthy
    if (!component.isAirworthy) {
      throw new ConflictException("Cannot install non-airworthy component");
    }

    // TODO: Close existing installation and create new one
    // This requires transaction support for proper implementation
    throw new Error("Installation not yet implemented - requires transaction support");
  }

  /**
   * Remove component from aircraft
   */
  async remove(dto: RemoveComponentDto) {
    const component = await this.componentRepository.findById(dto.componentId);
    if (!component) {
      throw new NotFoundException("Component not found");
    }

    // TODO: Update installation record with removedAt timestamp
    throw new Error("Removal not yet implemented - requires transaction support");
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
