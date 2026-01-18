/**
 * Maintenance Compliance Report PDF Template
 *
 * Generates a PDF report showing maintenance compliance status
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { styles, formatDate, formatNumber, formatPercentage } from "./common-styles";

export interface MaintenanceComplianceReportData {
  reportDate: number;
  reportPeriod: string;
  organization: string;
  summary: {
    totalScheduled: number;
    completed: number;
    inProgress: number;
    overdue: number;
    complianceRate: number;
    avgCompletionTime: number;
  };
  workOrderStats: {
    open: number;
    inProgress: number;
    pendingReview: number;
    completed: number;
  };
  overdueItems: {
    aircraftRegistration: string;
    taskName: string;
    dueDate: string;
    overdueDays: number;
    priority: string;
  }[];
  completedMaintenance: {
    workOrderId: string;
    aircraftRegistration: string;
    description: string;
    completedDate: number;
    technician: string;
    workHours: number;
  }[];
  monthlyTrend: {
    month: string;
    scheduled: number;
    completed: number;
    complianceRate: number;
  }[];
}

interface MaintenanceComplianceReportProps {
  data: MaintenanceComplianceReportData;
}

export function MaintenanceComplianceReport({ data }: MaintenanceComplianceReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>维保合规报告</Text>
          <Text style={styles.headerSubtitle}>
            {data.organization} · {data.reportPeriod} · 生成日期: {formatDate(data.reportDate)}
          </Text>
        </View>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>维保概览</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>计划维保</Text>
              <Text style={styles.summaryItemValue}>{data.summary.totalScheduled}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>已完成</Text>
              <Text style={styles.summaryItemValue}>{data.summary.completed}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>进行中</Text>
              <Text style={styles.summaryItemValue}>{data.summary.inProgress}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>超期</Text>
              <Text style={[styles.summaryItemValue, { color: data.summary.overdue > 0 ? "#dc2626" : "#1e3a8a" }]}>
                {data.summary.overdue}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>合规率</Text>
              <Text style={styles.summaryItemValue}>{formatPercentage(data.summary.complianceRate)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>平均完成时间</Text>
              <Text style={styles.summaryItemValue}>{formatNumber(data.summary.avgCompletionTime, 1)}h</Text>
            </View>
          </View>
        </View>

        {/* Work Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>工单状态分布</Text>
          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={{ width: "25%", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#dc2626" }}>{data.workOrderStats.open}</Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>待处理</Text>
            </View>
            <View style={{ width: "25%", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#2563eb" }}>{data.workOrderStats.inProgress}</Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>进行中</Text>
            </View>
            <View style={{ width: "25%", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#d97706" }}>{data.workOrderStats.pendingReview}</Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>待审核</Text>
            </View>
            <View style={{ width: "25%", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#16a34a" }}>{data.workOrderStats.completed}</Text>
              <Text style={{ fontSize: 8, color: "#64748b" }}>已完成</Text>
            </View>
          </View>
        </View>

        {/* Overdue Items Alert */}
        {data.overdueItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertBox}>
              <Text style={[styles.alertText, styles.bold]}>
                警告: {data.overdueItems.length} 项维保已超期
              </Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>注册号</Text>
                <Text style={[styles.tableHeaderCell, { width: "35%" }]}>维保项目</Text>
                <Text style={[styles.tableHeaderCell, { width: "18%" }]}>到期日期</Text>
                <Text style={[styles.tableHeaderCell, { width: "15%" }]}>超期天数</Text>
                <Text style={[styles.tableHeaderCell, { width: "17%" }]}>优先级</Text>
              </View>
              {data.overdueItems.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "15%" }]}>{item.aircraftRegistration}</Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>{item.taskName}</Text>
                  <Text style={[styles.tableCell, { width: "18%" }]}>{item.dueDate}</Text>
                  <Text style={[styles.tableCell, { width: "15%", color: "#dc2626" }]}>{item.overdueDays} 天</Text>
                  <Text style={[styles.tableCell, { width: "17%" }]}>
                    {item.priority === "CRITICAL" ? "紧急" :
                     item.priority === "HIGH" ? "高" :
                     item.priority === "MEDIUM" ? "中" : "低"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Completed Maintenance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>近期完成维保</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>工单号</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>注册号</Text>
              <Text style={[styles.tableHeaderCell, { width: "30%" }]}>维保内容</Text>
              <Text style={[styles.tableHeaderCell, { width: "16%" }]}>完成日期</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>技术员</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>工时</Text>
            </View>
            {data.completedMaintenance.slice(0, 8).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "12%" }]}>{item.workOrderId}</Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>{item.aircraftRegistration}</Text>
                <Text style={[styles.tableCell, { width: "30%" }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { width: "16%" }]}>{formatDate(item.completedDate)}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{item.technician}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{formatNumber(item.workHours, 1)}h</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            DroneMaintenance-Ledger · 维保合规报告
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
