import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Bot, Clock } from "lucide-react";

interface Domain {
  id: number;
  name: string;
}

interface RecentActivityProps {
  domains?: Domain[];
}

export function RecentActivity({ domains = [] }: RecentActivityProps) {
  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs/recent"],
    enabled: domains.length > 0,
    staleTime: 30000, // Refetch every 30 seconds
  });

  const getStatusDot = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No recent analysis jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(job.status)}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{job.url}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleString()} • {job.domain?.name || "Unknown domain"}
                    </div>
                  </div>
                  {getStatusText(job.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LLM Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Provider</span>
              <span className="text-sm text-gray-900">OpenAI GPT-4o</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm text-green-600">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Avg Processing Time</span>
              <span className="text-sm text-gray-900">1.2s</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button className="w-full">
                <Bot className="w-4 h-4 mr-2" />
                Configure Providers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
