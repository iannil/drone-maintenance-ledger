import { createBrowserRouter, redirect } from "react-router-dom";

import { LoginPage } from "./pages/login-page";
import { DashboardLayout } from "./pages/dashboard-layout";
import { DashboardPage } from "./pages/dashboard-page";
import { FleetListPage } from "./pages/fleet-list-page";
import { AircraftListPage } from "./pages/aircraft-list-page";
import { AircraftDetailPage } from "./pages/aircraft-detail-page";
import { AircraftFormPage } from "./pages/aircraft-form-page";
import { ComponentListPage } from "./pages/component-list-page";
import { ComponentDetailPage } from "./pages/component-detail-page";
import { ComponentFormPage } from "./pages/component-form-page";
import { MaintenanceSchedulePage } from "./pages/maintenance-schedule-page";
import { MaintenanceScheduleFormPage } from "./pages/maintenance-schedule-form-page";
import { WorkOrderListPage } from "./pages/work-order-list-page";
import { WorkOrderDetailPage } from "./pages/work-order-detail-page";
import { WorkOrderFormPage } from "./pages/work-order-form-page";
import { WorkOrderExecutePage } from "./pages/work-order-execute-page";
import { WorkOrderReleasePage } from "./pages/work-order-release-page";
import { FlightLogListPage } from "./pages/flight-log-list-page";
import { FlightLogDetailPage } from "./pages/flight-log-detail-page";
import { FlightLogFormPage } from "./pages/flight-log-form-page";
import { PirepFormPage } from "./pages/pirep-form-page";
import { ReportsDashboardPage } from "./pages/reports-dashboard-page";
import { SettingsPage } from "./pages/settings-page";
import { InventoryPage } from "./pages/inventory-page";
import { InventoryMovementsPage } from "./pages/inventory-movements-page";
import { ComponentTransfersPage } from "./pages/component-transfers-page";
import { UsersPage } from "./pages/users-page";
import { RolesPage } from "./pages/roles-page";
import { ComponentRemovalsPage } from "./pages/component-removals-page";
import { FlightLogSearchPage } from "./pages/flight-log-search-page";
import { WorkOrderSearchPage } from "./pages/work-order-search-page";
import { FlightStatsPage } from "./pages/flight-stats-page";
import { MaintenanceHistoryPage } from "./pages/maintenance-history-page";
import { InventoryAlertsPage } from "./pages/inventory-alerts-page";
import { PirepListPage } from "./pages/pirep-list-page";
import { ProfileSettingsPage } from "./pages/profile-settings-page";
import { FleetDetailPage } from "./pages/fleet-detail-page";
import { MaintenanceCalendarPage } from "./pages/maintenance-calendar-page";
import { LlpTrackingPage } from "./pages/llp-tracking-page";
import { AirworthinessPage } from "./pages/airworthiness-page";
import { NotificationsPage } from "./pages/notifications-page";
import { ReportsDataDashboardPage } from "./pages/reports-data-dashboard-page";
import { ComponentRemovalDetailPage } from "./pages/component-removal-detail-page";
import { TaskCardTemplatesPage } from "./pages/task-card-templates-page";
import { SuppliersPage } from "./pages/suppliers-page";
import { PurchaseOrdersPage } from "./pages/purchase-orders-page";

/**
 * Application router configuration
 */
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    loader: () => {
      // TODO: Check authentication
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return redirect("/login");
      }
      return null;
    },
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Fleet Management
      {
        path: "fleets",
        element: <FleetListPage />,
      },
      {
        path: "fleets/:id",
        element: <FleetDetailPage />,
      },
      // Aircraft Management
      {
        path: "aircraft",
        element: <AircraftListPage />,
      },
      {
        path: "aircraft/new",
        element: <AircraftFormPage />,
      },
      {
        path: "aircraft/:id/edit",
        element: <AircraftFormPage />,
      },
      {
        path: "aircraft/:id",
        element: <AircraftDetailPage />,
      },
      // Component Management
      {
        path: "components",
        element: <ComponentListPage />,
      },
      {
        path: "components/new",
        element: <ComponentFormPage />,
      },
      {
        path: "components/:id/edit",
        element: <ComponentFormPage />,
      },
      {
        path: "components/:id",
        element: <ComponentDetailPage />,
      },
      // Maintenance Management
      {
        path: "maintenance/schedules",
        element: <MaintenanceSchedulePage />,
      },
      {
        path: "maintenance/schedules/new",
        element: <MaintenanceScheduleFormPage />,
      },
      {
        path: "maintenance/schedules/:id",
        element: <MaintenanceSchedulePage />,
      },
      {
        path: "maintenance/calendar",
        element: <MaintenanceCalendarPage />,
      },
      // Work Order Management
      {
        path: "work-orders",
        element: <WorkOrderListPage />,
      },
      {
        path: "work-orders/new",
        element: <WorkOrderFormPage />,
      },
      {
        path: "work-orders/:id",
        element: <WorkOrderDetailPage />,
      },
      {
        path: "work-orders/:id/edit",
        element: <WorkOrderFormPage />,
      },
      {
        path: "work-orders/:id/execute",
        element: <WorkOrderExecutePage />,
      },
      {
        path: "work-orders/:id/release",
        element: <WorkOrderReleasePage />,
      },
      // Flight Logs
      {
        path: "flight-logs",
        element: <FlightLogListPage />,
      },
      {
        path: "flight-logs/new",
        element: <FlightLogFormPage />,
      },
      {
        path: "flight-logs/:id",
        element: <FlightLogDetailPage />,
      },
      {
        path: "flight-logs/:id/edit",
        element: <FlightLogFormPage />,
      },
      // PIREP
      {
        path: "pirep/new",
        element: <PirepFormPage />,
      },
      {
        path: "pirep",
        element: <PirepListPage />,
      },
      // Reports
      {
        path: "reports",
        element: <ReportsDashboardPage />,
      },
      {
        path: "reports/dashboard",
        element: <ReportsDataDashboardPage />,
      },
      // Settings
      {
        path: "settings",
        element: <SettingsPage />,
      },
      // Inventory Management
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "inventory/movements",
        element: <InventoryMovementsPage />,
      },
      {
        path: "inventory/alerts",
        element: <InventoryAlertsPage />,
      },
      // Component Transfers
      {
        path: "components/:id/transfers",
        element: <ComponentTransfersPage />,
      },
      // System Management
      {
        path: "settings/users",
        element: <UsersPage />,
      },
      {
        path: "settings/roles",
        element: <RolesPage />,
      },
      // Component Removals
      {
        path: "components/removals",
        element: <ComponentRemovalsPage />,
      },
      {
        path: "components/removals/:id",
        element: <ComponentRemovalDetailPage />,
      },
      // Advanced Search
      {
        path: "flight-logs/search",
        element: <FlightLogSearchPage />,
      },
      {
        path: "work-orders/search",
        element: <WorkOrderSearchPage />,
      },
      // Analytics
      {
        path: "analytics/flight-stats",
        element: <FlightStatsPage />,
      },
      {
        path: "maintenance/history",
        element: <MaintenanceHistoryPage />,
      },
      // Airworthiness
      {
        path: "airworthiness",
        element: <AirworthinessPage />,
      },
      // Life-Limited Parts Tracking
      {
        path: "llp/tracking",
        element: <LlpTrackingPage />,
      },
      // Notifications
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      // Profile
      {
        path: "profile/settings",
        element: <ProfileSettingsPage />,
      },
      // Task Card Templates
      {
        path: "templates/task-cards",
        element: <TaskCardTemplatesPage />,
      },
      // Suppliers
      {
        path: "suppliers",
        element: <SuppliersPage />,
      },
      // Purchase Orders
      {
        path: "purchase-orders",
        element: <PurchaseOrdersPage />,
      },
    ],
  },
]);
