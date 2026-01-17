/**
 * Trigger Calculation Service
 *
 * Calculates maintenance due dates based on trigger types
 */

import { Injectable } from "@nestjs/common";

import type { MaintenanceTrigger, Aircraft, Component } from "@repo/db";
import { MaintenanceTriggerTypeEnum } from "@repo/db";

/**
 * Calculation result
 */
export interface TriggerCalculationResult {
  triggerId: string;
  triggerName: string;
  triggerType: string;
  dueDate: number | null;
  dueAtValue: number | null;
  currentValue: number;
  remainingValue: number;
  remainingDays: number | null;
  percentageUsed: number;
  status: "OK" | "WARNING" | "DUE" | "OVERDUE";
}

/**
 * Trigger calculation options
 */
export interface CalculationContext {
  aircraft: Aircraft;
  component?: Component;
  lastCompletedAt?: number;
  lastCompletedAtValue?: number;
}

@Injectable()
export class TriggerCalculationService {
  /**
   * Warning threshold - percentage of interval when warning is triggered
   */
  private readonly WARNING_THRESHOLD = 0.8; // 80%

  /**
   * Calculate due date/value for a single trigger
   */
  calculateTrigger(
    trigger: MaintenanceTrigger,
    context: CalculationContext
  ): TriggerCalculationResult {
    const { aircraft, component, lastCompletedAt, lastCompletedAtValue } = context;

    switch (trigger.type) {
      case MaintenanceTriggerTypeEnum.CALENDAR_DAYS:
        return this.calculateCalendarDays(trigger, lastCompletedAt);

      case MaintenanceTriggerTypeEnum.FLIGHT_HOURS:
        return this.calculateFlightHours(trigger, aircraft, lastCompletedAtValue);

      case MaintenanceTriggerTypeEnum.FLIGHT_CYCLES:
        return this.calculateFlightCycles(trigger, aircraft, lastCompletedAtValue);

      case MaintenanceTriggerTypeEnum.BATTERY_CYCLES:
        return this.calculateBatteryCycles(trigger, component, lastCompletedAtValue);

      case MaintenanceTriggerTypeEnum.CALENDAR_DATE:
        return this.calculateCalendarDate(trigger);

      default:
        return this.createDefaultResult(trigger);
    }
  }

  /**
   * Calculate multiple triggers for an aircraft
   */
  calculateAllTriggers(
    triggers: MaintenanceTrigger[],
    context: CalculationContext,
    lastCompletedMap: Map<string, { at: number; value: number }>
  ): TriggerCalculationResult[] {
    return triggers.map((trigger) => {
      const lastCompleted = lastCompletedMap.get(trigger.id);
      return this.calculateTrigger(trigger, {
        ...context,
        lastCompletedAt: lastCompleted?.at,
        lastCompletedAtValue: lastCompleted?.value,
      });
    });
  }

  /**
   * Calculate for calendar days trigger (e.g., every 180 days)
   */
  private calculateCalendarDays(
    trigger: MaintenanceTrigger,
    lastCompletedAt?: number
  ): TriggerCalculationResult {
    const now = Date.now();
    const intervalMs = trigger.intervalValue * 24 * 60 * 60 * 1000;

    // If never completed, due immediately from creation
    const baseDate = lastCompletedAt || trigger.createdAt;
    const dueDate = baseDate + intervalMs;

    const remainingMs = dueDate - now;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    const elapsedMs = now - baseDate;
    const percentageUsed = Math.min(100, (elapsedMs / intervalMs) * 100);

    let status: TriggerCalculationResult["status"] = "OK";
    if (remainingMs <= 0) {
      status = "OVERDUE";
    } else if (remainingDays <= 0) {
      status = "DUE";
    } else if (percentageUsed >= this.WARNING_THRESHOLD * 100) {
      status = "WARNING";
    }

    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      dueDate,
      dueAtValue: null,
      currentValue: Math.floor(elapsedMs / (24 * 60 * 60 * 1000)),
      remainingValue: Math.max(0, remainingDays),
      remainingDays,
      percentageUsed,
      status,
    };
  }

  /**
   * Calculate for flight hours trigger (e.g., every 50 hours)
   */
  private calculateFlightHours(
    trigger: MaintenanceTrigger,
    aircraft: Aircraft,
    lastCompletedAtValue?: number
  ): TriggerCalculationResult {
    const currentHours = aircraft.totalFlightHours;
    const baseValue = lastCompletedAtValue || 0;
    const dueAtValue = baseValue + trigger.intervalValue;

    const remaining = dueAtValue - currentHours;
    const elapsed = currentHours - baseValue;
    const percentageUsed = Math.min(100, (elapsed / trigger.intervalValue) * 100);

    // Estimate days remaining based on average flight hours per day
    // Assume 2 hours average per day if we have historical data
    const avgHoursPerDay = 2;
    const remainingDays = remaining > 0 ? Math.ceil(remaining / avgHoursPerDay) : 0;

    let status: TriggerCalculationResult["status"] = "OK";
    if (remaining <= 0) {
      status = "OVERDUE";
    } else if (remaining <= 5) {
      status = "DUE";
    } else if (percentageUsed >= this.WARNING_THRESHOLD * 100) {
      status = "WARNING";
    }

    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      dueDate: null,
      dueAtValue,
      currentValue: currentHours,
      remainingValue: Math.max(0, remaining),
      remainingDays,
      percentageUsed,
      status,
    };
  }

  /**
   * Calculate for flight cycles trigger (e.g., every 200 cycles)
   */
  private calculateFlightCycles(
    trigger: MaintenanceTrigger,
    aircraft: Aircraft,
    lastCompletedAtValue?: number
  ): TriggerCalculationResult {
    const currentCycles = aircraft.totalFlightCycles;
    const baseValue = lastCompletedAtValue || 0;
    const dueAtValue = baseValue + trigger.intervalValue;

    const remaining = dueAtValue - currentCycles;
    const elapsed = currentCycles - baseValue;
    const percentageUsed = Math.min(100, (elapsed / trigger.intervalValue) * 100);

    // Estimate days remaining based on average cycles per day
    // Assume 3 cycles average per day
    const avgCyclesPerDay = 3;
    const remainingDays = remaining > 0 ? Math.ceil(remaining / avgCyclesPerDay) : 0;

    let status: TriggerCalculationResult["status"] = "OK";
    if (remaining <= 0) {
      status = "OVERDUE";
    } else if (remaining <= 10) {
      status = "DUE";
    } else if (percentageUsed >= this.WARNING_THRESHOLD * 100) {
      status = "WARNING";
    }

    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      dueDate: null,
      dueAtValue,
      currentValue: currentCycles,
      remainingValue: Math.max(0, remaining),
      remainingDays,
      percentageUsed,
      status,
    };
  }

  /**
   * Calculate for battery cycles trigger (e.g., every 300 charge cycles)
   */
  private calculateBatteryCycles(
    trigger: MaintenanceTrigger,
    component?: Component,
    lastCompletedAtValue?: number
  ): TriggerCalculationResult {
    const currentCycles = component?.batteryCycles || 0;
    const baseValue = lastCompletedAtValue || 0;
    const dueAtValue = baseValue + trigger.intervalValue;

    const remaining = dueAtValue - currentCycles;
    const elapsed = currentCycles - baseValue;
    const percentageUsed = Math.min(100, (elapsed / trigger.intervalValue) * 100);

    // Estimate days remaining based on average cycles per day
    // Assume 1 cycle average per day
    const avgCyclesPerDay = 1;
    const remainingDays = remaining > 0 ? Math.ceil(remaining / avgCyclesPerDay) : 0;

    let status: TriggerCalculationResult["status"] = "OK";
    if (remaining <= 0) {
      status = "OVERDUE";
    } else if (remaining <= 20) {
      status = "DUE";
    } else if (percentageUsed >= this.WARNING_THRESHOLD * 100) {
      status = "WARNING";
    }

    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      dueDate: null,
      dueAtValue,
      currentValue: currentCycles,
      remainingValue: Math.max(0, remaining),
      remainingDays,
      percentageUsed,
      status,
    };
  }

  /**
   * Calculate for calendar date trigger (specific annual date)
   */
  private calculateCalendarDate(trigger: MaintenanceTrigger): TriggerCalculationResult {
    const now = Date.now();
    const currentYear = new Date().getFullYear();

    // intervalValue represents the day of year (1-365)
    const dayOfYear = trigger.intervalValue;
    const dueDate = this.dayOfYearToTimestamp(currentYear, dayOfYear);

    // If due date has passed this year, use next year
    const adjustedDueDate = dueDate < now
      ? this.dayOfYearToTimestamp(currentYear + 1, dayOfYear)
      : dueDate;

    const remainingMs = adjustedDueDate - now;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    const percentageUsed = 100 - (remainingDays / 365) * 100;

    let status: TriggerCalculationResult["status"] = "OK";
    if (remainingDays <= 0) {
      status = "DUE";
    } else if (remainingDays <= 30) {
      status = "WARNING";
    }

    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      dueDate: adjustedDueDate,
      dueAtValue: null,
      currentValue: 365 - remainingDays,
      remainingValue: remainingDays,
      remainingDays,
      percentageUsed,
      status,
    };
  }

  /**
   * Create default result for unknown trigger types
   */
  private createDefaultResult(trigger: MaintenanceTrigger): TriggerCalculationResult {
    return {
      triggerId: trigger.id,
      triggerName: trigger.name,
      triggerType: trigger.type,
      dueDate: null,
      dueAtValue: null,
      currentValue: 0,
      remainingValue: 0,
      remainingDays: null,
      percentageUsed: 0,
      status: "OK",
    };
  }

  /**
   * Convert day of year to timestamp
   */
  private dayOfYearToTimestamp(year: number, dayOfYear: number): number {
    const date = new Date(year, 0, dayOfYear);
    return date.getTime();
  }

  /**
   * Determine overall status from multiple calculation results
   */
  getOverallStatus(results: TriggerCalculationResult[]): "OK" | "WARNING" | "DUE" | "OVERDUE" {
    if (results.some((r) => r.status === "OVERDUE")) return "OVERDUE";
    if (results.some((r) => r.status === "DUE")) return "DUE";
    if (results.some((r) => r.status === "WARNING")) return "WARNING";
    return "OK";
  }

  /**
   * Get the most urgent trigger (smallest remaining value)
   */
  getMostUrgent(results: TriggerCalculationResult[]): TriggerCalculationResult | null {
    if (results.length === 0) return null;

    return results.reduce((most, current) => {
      const mostDays = most.remainingDays ?? Infinity;
      const currentDays = current.remainingDays ?? Infinity;
      return currentDays < mostDays ? current : most;
    });
  }
}
