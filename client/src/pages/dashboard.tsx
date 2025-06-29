import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { DomainsTable } from "@/components/dashboard/domains-table";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Zap } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { status, user, isLoading } = useConnectionStatus();
  const { toast } = useToast();

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/overview"],
    enabled: status === "connected",
  });

  const { data: domains } = useQuery({
    queryKey: ["/api/domains"],
    enabled: status === "connected",
  });

  useEffect(() => {
    if (status === "not-connected" && !isLoading) {
      setLocation("/");
    }
  }, [status, isLoading, setLocation]);

  const handleDisconnect = async () => {
    try {
      await authService.disconnect();
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Cloudflare",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Disconnect failed",
        description: "Failed to disconnect from Cloudflare",
        variant: "destructive",
      });
    }
  };

  if (isLoading || status === "connecting") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Connection Error</h1>
          <p className="text-sm text-gray-600 mb-4">Failed to connect to your account</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your SEO optimization and AI analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Connected to Cloudflare</span>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="p-8">
          <StatsOverview analytics={analytics} />
          <DomainsTable domains={domains} />
          <RecentActivity domains={domains} />
        </section>
      </main>
    </div>
  );
}
