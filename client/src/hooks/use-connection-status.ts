import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/auth";

export type ConnectionStatus = "not-connected" | "connecting" | "connected" | "error";

export function useConnectionStatus() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  let status: ConnectionStatus = "not-connected";
  
  if (!authService.isAuthenticated()) {
    status = "not-connected";
  } else if (isLoading) {
    status = "connecting";
  } else if (error) {
    status = "error";
  } else if (user?.isConnected) {
    status = "connected";
  } else {
    status = "not-connected";
  }

  return {
    status,
    user,
    isLoading,
    error,
  };
}
