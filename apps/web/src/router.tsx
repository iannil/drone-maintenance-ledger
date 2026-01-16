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
      // Reports
      {
        path: "reports",
        element: <ReportsDashboardPage />,
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
      // Component Transfers
      {
        path: "components/:id/transfers",
        element: <ComponentTransfersPage />,
      },
    ],
  },
]);
