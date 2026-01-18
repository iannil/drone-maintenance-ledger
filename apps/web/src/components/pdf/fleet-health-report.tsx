/**
 * Fleet Health Report PDF Template
 *
 * Generates a PDF report showing fleet health status
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { styles, formatDate, formatNumber, formatPercentage } from "./common-styles";

export interface FleetHealthReportData {
  reportDate: number;
  reportPeriod: string;
  organization: string;
  fleetSummary: {
    totalAircraft: number;
    serviceableAircraft: number;
    maintenanceAircraft: number;
    groundedAircraft: number;
    utilizationRate: number;
  };
  aircraftList: {
    id: string;
    registration: string;
    model: string;
    status: string;
    totalFlightHours: number;
    totalCycles: number;
    lastInspectionDate: number | null;
    nextMaintenanceDue: string;
    healthScore: number;
  }[];
  recentMaintenance: {
    workOrderId: string;
    aircraftRegistration: string;
    description: string;
    completedDate: number;
    status: string;
  }[];
  upcomingMaintenance: {
    aircraftRegistration: string;
    taskName: string;
    dueDate: string;
    priority: string;
  }[];
}

interface FleetHealthReportProps {
  data: FleetHealthReportData;
}

export function FleetHealthReport({ data }: FleetHealthReportProps) {
  const healthRate = data.fleetSummary.totalAircraft > 0
    ? data.fleetSummary.serviceableAircraft / data.fleetSummary.totalAircraft
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>机队健康报告</Text>
          <Text style={styles.headerSubtitle}>
            {data.organization} · {data.reportPeriod} · 生成日期: {formatDate(data.reportDate)}
          </Text>
        </View>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>机队概览</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>飞机总数</Text>
              <Text style={styles.summaryItemValue}>{data.fleetSummary.totalAircraft}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>可用飞机</Text>
              <Text style={styles.summaryItemValue}>{data.fleetSummary.serviceableAircraft}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>维护中</Text>
              <Text style={styles.summaryItemValue}>{data.fleetSummary.maintenanceAircraft}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>停飞</Text>
              <Text style={styles.summaryItemValue}>{data.fleetSummary.groundedAircraft}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>健康率</Text>
              <Text style={styles.summaryItemValue}>{formatPercentage(healthRate)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>利用率</Text>
              <Text style={styles.summaryItemValue}>{formatPercentage(data.fleetSummary.utilizationRate)}</Text>
            </View>
          </View>
        </View>

        {/* Aircraft Status Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>飞机状态明细</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>注册号</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>机型</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>状态</Text>
              <Text style={[styles.tableHeaderCell, { width: "13%" }]}>飞行小时</Text>
              <Text style={[styles.tableHeaderCell, { width: "13%" }]}>起降次数</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>上次检查</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>健康分</Text>
            </View>
            {data.aircraftList.slice(0, 10).map((aircraft) => (
              <View key={aircraft.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "15%" }]}>{aircraft.registration}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{aircraft.model}</Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>
                  {aircraft.status === "AVAILABLE" ? "可用" :
                   aircraft.status === "IN_MAINTENANCE" ? "维护中" :
                   aircraft.status === "AOG" ? "停飞" : "退役"}
                </Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{formatNumber(aircraft.totalFlightHours)}h</Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>{aircraft.totalCycles}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{formatDate(aircraft.lastInspectionDate)}</Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>{aircraft.healthScore}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Maintenance */}
        {data.upcomingMaintenance.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>即将到期维保</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>注册号</Text>
                <Text style={[styles.tableHeaderCell, { width: "40%" }]}>维保项目</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>到期时间</Text>
                <Text style={[styles.tableHeaderCell, { width: "20%" }]}>优先级</Text>
              </View>
              {data.upcomingMaintenance.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{item.aircraftRegistration}</Text>
                  <Text style={[styles.tableCell, { width: "40%" }]}>{item.taskName}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>{item.dueDate}</Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {item.priority === "CRITICAL" ? "紧急" :
                     item.priority === "HIGH" ? "高" :
                     item.priority === "MEDIUM" ? "中" : "低"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            DroneMaintenance-Ledger · 机队健康报告
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
