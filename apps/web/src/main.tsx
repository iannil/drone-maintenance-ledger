import { StrictMode, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { router } from "./router";
import { ToastProvider, useToast, setGlobalToast } from "./components/ui/toast";
import { onApiError } from "./services/api";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Component to set up global toast and API error handling
 */
function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  useEffect(() => {
    // Set global toast for use outside React
    setGlobalToast(toast.toast);

    // Subscribe to API errors
    const unsubscribe = onApiError((error) => {
      // Don't show toast for 401 (handled by redirect)
      if (error.status === 401) return;

      const title = error.status >= 500 ? "服务器错误" : "请求失败";
      toast.error(title, error.message);
    });

    return unsubscribe;
  }, [toast]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <GlobalErrorHandler>
          <RouterProvider router={router} />
        </GlobalErrorHandler>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
