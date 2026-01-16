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
    ],
  },
]);
