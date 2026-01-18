/**
 * Common PDF styles for report generation
 */
import { StyleSheet, Font } from "@react-pdf/renderer";

// Register Chinese fonts if needed (using system fonts)
Font.register({
  family: "NotoSansSC",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG-vEnYxNbPzS5HE.ttf",
      fontWeight: "bold",
    },
  ],
});

/**
 * Common PDF styles
 */
export const styles = StyleSheet.create({
  // Page styles
  page: {
    fontFamily: "NotoSansSC",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
  },

  // Header styles
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
    paddingBottom: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 10,
    color: "#64748b",
  },

  logo: {
    width: 80,
    marginBottom: 10,
  },

  // Section styles
  section: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  // Content styles
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },

  label: {
    width: "30%",
    fontSize: 9,
    color: "#64748b",
  },

  value: {
    width: "70%",
    fontSize: 10,
    color: "#1e293b",
  },

  // Table styles
  table: {
    width: "100%",
    marginTop: 8,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  tableCell: {
    fontSize: 9,
    color: "#334155",
  },

  // Summary box styles
  summaryBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  summaryItem: {
    width: "50%",
    marginBottom: 8,
  },

  summaryItemLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },

  summaryItemValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  // Alert styles
  alertBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },

  alertText: {
    fontSize: 9,
    color: "#991b1b",
  },

  warningBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },

  warningText: {
    fontSize: 9,
    color: "#92400e",
  },

  // Status badge styles
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
  },

  statusGreen: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },

  statusYellow: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
  },

  statusRed: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },

  // Footer styles
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },

  pageNumber: {
    fontSize: 8,
    color: "#64748b",
  },

  // Utility styles
  bold: {
    fontWeight: "bold",
  },

  italic: {
    fontStyle: "italic",
  },

  textRight: {
    textAlign: "right",
  },

  textCenter: {
    textAlign: "center",
  },

  mt4: {
    marginTop: 4,
  },

  mt8: {
    marginTop: 8,
  },

  mb4: {
    marginBottom: 4,
  },

  mb8: {
    marginBottom: 8,
  },
});

/**
 * Format date for display in PDF
 */
export function formatDate(timestamp: number | null | undefined): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format datetime for display in PDF
 */
export function formatDateTime(timestamp: number | null | undefined): string {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format number with fixed decimals
 */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "-";
  return value.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${(value * 100).toFixed(1)}%`;
}
