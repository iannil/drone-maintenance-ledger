import { useState, useEffect } from "react";

/**
 * Hook to detect network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to detect service worker update availability
 */
export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    // Only run in production
    if (import.meta.env.DEV) return;

    const registerSW = async () => {
      try {
        const { registerSW } = await import("virtual:pwa-register");
        registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            setOfflineReady(true);
          },
          onRegisteredSW(swUrl, registration) {
            console.log("SW Registered:", swUrl);
            // Check for updates every hour
            if (registration) {
              setInterval(() => {
                registration.update();
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError(error) {
            console.error("SW registration error:", error);
          },
        });
      } catch (error) {
        console.error("Failed to register service worker:", error);
      }
    };

    registerSW();
  }, []);

  const updateServiceWorker = async () => {
    const { registerSW } = await import("virtual:pwa-register");
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
    await updateSW(true);
  };

  return { needRefresh, offlineReady, updateServiceWorker };
}
