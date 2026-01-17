import { Injectable, NotFoundException } from "@nestjs/common";
import { eq, and, isNull, desc, sql } from "drizzle-orm";

import type { Component, NewComponent, ComponentInstallation } from "@repo/db";
import { component, componentInstallation } from "@repo/db";
import { db } from "@repo/db";

/**
 * Component repository
 *
 * Handles database operations for components with history tracking
 */
@Injectable()
export class ComponentRepository {
  /**
   * Find component by ID
   */
  async findById(id: string): Promise<Component | null> {
    const result = await db.select().from(component).where(eq(component.id, id));
    return result[0] || null;
  }

  /**
   * Find component by serial number
   */
  async findBySerialNumber(serialNumber: string): Promise<Component | null> {
    const result = await db.select().from(component).where(eq(component.serialNumber, serialNumber));
    return result[0] || null;
  }

  /**
   * Find component by serial number with current installation
   */
  async findBySerialWithInstallation(serialNumber: string) {
    const compResult = await db.select().from(component).where(eq(component.serialNumber, serialNumber));
    if (!compResult[0]) return null;

    const installResult = await db
      .select()
      .from(componentInstallation)
      .where(and(eq(componentInstallation.componentId, compResult[0].id), isNull(componentInstallation.removedAt)));

    return {
      component: compResult[0],
      installation: installResult[0] || null,
    };
  }

  /**
   * Create new component
   */
  async create(data: NewComponent): Promise<Component> {
    const result = await db.insert(component).values(data).returning();
    if (!result[0]) {
      throw new Error("Failed to create component");
    }
    return result[0];
  }

  /**
   * Update component
   */
  async update(id: string, data: Partial<NewComponent>): Promise<Component> {
    const result = await db
      .update(component)
      .set({ ...data, updatedAt: Date.now() })
      .where(eq(component.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Component with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Update component lifecycle metrics
   * Called after flight to update cumulative hours/cycles
   */
  async updateLifecycleMetrics(
    id: string,
    flightHours: number,
    flightCycles: number,
    batteryCycles?: number,
  ): Promise<Component> {
    const result = await db
      .update(component)
      .set({
        totalFlightHours: sql<number>`${component.totalFlightHours} + ${flightHours}`,
        totalFlightCycles: sql<number>`${component.totalFlightCycles} + ${flightCycles}`,
        ...(batteryCycles !== undefined && {
          batteryCycles: sql<number>`${component.batteryCycles} + ${batteryCycles}`,
        }),
        updatedAt: Date.now(),
      })
      .where(eq(component.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Component with id ${id} not found`);
    }

    return result[0];
  }

  /**
   * Delete component
   */
  async delete(id: string): Promise<void> {
    await db.delete(component).where(eq(component.id, id));
  }

  /**
   * List all components
   */
  async list(limit: number = 50, offset: number = 0): Promise<Component[]> {
    return db.select().from(component).limit(limit).offset(offset);
  }

  /**
   * Find components currently installed on an aircraft
   */
  async findInstalledOnAircraft(aircraftId: string) {
    return db
      .select({
        // Component fields
        id: component.id,
        serialNumber: component.serialNumber,
        partNumber: component.partNumber,
        type: component.type,
        manufacturer: component.manufacturer,
        model: component.model,
        description: component.description,
        totalFlightHours: component.totalFlightHours,
        totalFlightCycles: component.totalFlightCycles,
        batteryCycles: component.batteryCycles,
        isLifeLimited: component.isLifeLimited,
        maxFlightHours: component.maxFlightHours,
        maxCycles: component.maxCycles,
        status: component.status,
        isAirworthy: component.isAirworthy,
        manufacturedAt: component.manufacturedAt,
        purchasedAt: component.purchasedAt,
        createdAt: component.createdAt,
        updatedAt: component.updatedAt,
        // Installation fields
        installationId: componentInstallation.id,
        aircraftId: componentInstallation.aircraftId,
        location: componentInstallation.location,
        flightHours: componentInstallation.flightHours,
        cycles: componentInstallation.cycles,
        installedAt: componentInstallation.installedAt,
      })
      .from(component)
      .innerJoin(
        componentInstallation,
        and(
          eq(componentInstallation.componentId, component.id),
          eq(componentInstallation.aircraftId, aircraftId),
          isNull(componentInstallation.removedAt),
        ),
      );
  }

  /**
   * Find components by type
   */
  async findByType(type: string, limit: number = 50): Promise<Component[]> {
    return db.select().from(component).where(eq(component.type, type)).limit(limit);
  }

  /**
   * Find components needing maintenance (near lifetime limits)
   */
  async findDueForMaintenance(): Promise<Component[]> {
    return db
      .select()
      .from(component)
      .where(
        and(
          eq(component.isLifeLimited, true),
          sql`(
            (${component.maxFlightHours} IS NOT NULL AND ${component.totalFlightHours} >= ${component.maxFlightHours} * 0.9) OR
            (${component.maxCycles} IS NOT NULL AND ${component.totalFlightCycles} >= ${component.maxCycles} * 0.9) OR
            (${component.batteryCycles} >= 300)
          )`,
        ),
      );
  }

  /**
   * Install component on aircraft
   *
   * Records the installation with the component's current cumulative metrics.
   * This ensures that when the component is removed, we know exactly what
   * metrics to credit to this installation period.
   */
  async install(
    componentId: string,
    aircraftId: string,
    location: string,
    notes?: string,
  ): Promise<void> {
    // Get current component metrics
    const comp = await this.findById(componentId);
    if (!comp) {
      throw new NotFoundException(`Component with id ${componentId} not found`);
    }

    // Insert new installation record with current cumulative values
    await db.insert(componentInstallation).values({
      componentId,
      aircraftId,
      location,
      installNotes: notes,
      // Inherit the component's cumulative values at install time
      inheritedFlightHours: comp.totalFlightHours,
      inheritedCycles: comp.totalFlightCycles,
      installedAt: Date.now(),
    });
  }

  /**
   * Remove component from aircraft
   *
   * Closes the installation record with removal timestamp and notes.
   * The component retains its cumulative metrics - they travel with it.
   */
  async remove(
    componentId: string,
    notes?: string,
  ): Promise<void> {
    // Find and close the current installation (removedAt IS NULL)
    const result = await db
      .update(componentInstallation)
      .set({
        removedAt: Date.now(),
        removeNotes: notes || null,
      })
      .where(
        and(
          eq(componentInstallation.componentId, componentId),
          isNull(componentInstallation.removedAt),
        ),
      )
      .returning();

    if (!result[0]) {
      throw new NotFoundException("No active installation found for this component");
    }
  }

  /**
   * Get installation history for a component
   */
  async getInstallationHistory(componentId: string) {
    return db
      .select()
      .from(componentInstallation)
      .where(eq(componentInstallation.componentId, componentId))
      .orderBy(desc(componentInstallation.installedAt));
  }

  /**
   * Get current installation for a component
   */
  async getCurrentInstallation(componentId: string) {
    const result = await db
      .select()
      .from(componentInstallation)
      .where(
        and(
          eq(componentInstallation.componentId, componentId),
          isNull(componentInstallation.removedAt),
        ),
      );

    return result[0] || null;
  }
}
