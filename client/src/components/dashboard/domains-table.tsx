import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface Domain {
  id: number;
  name: string;
  zoneId: string;
  status: string;
  pagesAnalyzed: number;
  lastAnalyzed: string | null;
  stats?: {
    total: number;
    completed: number;
    failed: number;
  };
}

interface DomainsTableProps {
  domains?: Domain[];
}

export function DomainsTable({ domains = [] }: DomainsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "syncing":
        return <Badge className="bg-yellow-100 text-yellow-800">Syncing</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatLastAnalyzed = (dateString: string | null) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  if (domains.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No domains found</h3>
            <p className="text-gray-600">
              Connect your Cloudflare account to start managing your domains.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Active Domains</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Analysis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.map((domain) => (
                <tr key={domain.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{domain.name}</div>
                        <div className="text-sm text-gray-500">Zone ID: {domain.zoneId.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(domain.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {domain.pagesAnalyzed || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastAnalyzed(domain.lastAnalyzed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 mr-2">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      Configure
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
