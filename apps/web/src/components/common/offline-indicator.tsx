import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { useNetworkStatus, useServiceWorkerUpdate } from "../../hooks/use-network-status";
import { Button } from "../ui/button";

/**
 * Offline indicator component
 * Shows network status and PWA update notifications
 */
export function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const { needRefresh, offlineReady, updateServiceWorker } = useServiceWorkerUpdate();

  // Show offline banner
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
        <div className="flex items-center gap-3 bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg">
          <WifiOff className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">离线模式</p>
            <p className="text-sm text-amber-100">
              您当前处于离线状态，部分功能可能受限
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show update available notification
  if (needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
        <div className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <RefreshCw className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">有新版本可用</p>
            <p className="text-sm text-blue-100">点击更新获取最新功能</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={updateServiceWorker}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            更新
          </Button>
        </div>
      </div>
    );
  }

  // Show offline ready notification (briefly)
  if (offlineReady) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">离线可用</p>
            <p className="text-sm text-green-100">应用已缓存，可离线使用</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
