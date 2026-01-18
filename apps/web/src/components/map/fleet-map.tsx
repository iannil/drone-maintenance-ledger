/**
 * Fleet Map Component
 *
 * Displays aircraft locations on an interactive map using Leaflet
 */

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MapPin, Plane, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons for different statuses
const createIcon = (color: string) =>
  new L.DivIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const STATUS_ICONS = {
  AVAILABLE: createIcon("#22c55e"),
  SERVICEABLE: createIcon("#22c55e"),
  IN_MAINTENANCE: createIcon("#eab308"),
  MAINTENANCE: createIcon("#eab308"),
  AOG: createIcon("#ef4444"),
  GROUNDED: createIcon("#ef4444"),
  RETIRED: createIcon("#6b7280"),
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "可用",
  SERVICEABLE: "可用",
  IN_MAINTENANCE: "维护中",
  MAINTENANCE: "维护中",
  AOG: "停飞",
  GROUNDED: "停飞",
  RETIRED: "退役",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-500",
  SERVICEABLE: "bg-green-500",
  IN_MAINTENANCE: "bg-yellow-500",
  MAINTENANCE: "bg-yellow-500",
  AOG: "bg-red-500",
  GROUNDED: "bg-red-500",
  RETIRED: "bg-gray-500",
};

export interface AircraftLocation {
  id: string;
  registrationNumber: string;
  model: string;
  status: string;
  latitude: number;
  longitude: number;
  lastFlightDate?: string;
  totalFlightHours?: number;
}

interface FleetMapProps {
  locations?: AircraftLocation[];
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * Component to recenter map when locations change
 */
function MapRecenter({ locations }: { locations: AircraftLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

/**
 * Fleet Map Component
 */
export function FleetMap({ locations = [], loading = false, onRefresh }: FleetMapProps) {
  // Default center (China)
  const defaultCenter: [number, number] = [35.8617, 104.1954];
  const defaultZoom = 5;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            机队位置地图
          </CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              机队位置地图
            </CardTitle>
            <CardDescription>
              {locations.length > 0
                ? `显示 ${locations.length} 架飞机的位置`
                : "暂无位置数据"}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>可用</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>维护中</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>停飞</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span>退役</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-96 rounded-lg overflow-hidden border">
          {locations.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-slate-50 text-muted-foreground">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无飞机位置数据</p>
                <p className="text-xs mt-1">请在飞行记录中添加位置信息</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter locations={locations} />
              {locations.map((aircraft) => (
                <Marker
                  key={aircraft.id}
                  position={[aircraft.latitude, aircraft.longitude]}
                  icon={STATUS_ICONS[aircraft.status as keyof typeof STATUS_ICONS] || STATUS_ICONS.AVAILABLE}
                >
                  <Popup>
                    <div className="min-w-48">
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="w-4 h-4" />
                        <span className="font-bold">{aircraft.registrationNumber}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">机型:</span> {aircraft.model}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-muted-foreground">状态:</span>
                          <Badge
                            variant="secondary"
                            className={`${STATUS_COLORS[aircraft.status] || "bg-gray-500"} text-white text-xs`}
                          >
                            {STATUS_LABELS[aircraft.status] || aircraft.status}
                          </Badge>
                        </p>
                        {aircraft.totalFlightHours !== undefined && (
                          <p>
                            <span className="text-muted-foreground">总飞行时:</span>{" "}
                            {aircraft.totalFlightHours.toFixed(1)} 小时
                          </p>
                        )}
                        {aircraft.lastFlightDate && (
                          <p>
                            <span className="text-muted-foreground">最后飞行:</span>{" "}
                            {aircraft.lastFlightDate}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t">
                        <Link
                          to={`/aircraft/${aircraft.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          查看详情 →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
