import { Button } from "@/components/ui/button";
import { Zap, BarChart3, Globe, Settings } from "lucide-react";
import { User } from "@/lib/auth";

interface SidebarProps {
  user?: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SEO Discoverly</span>
        </div>
      </div>
      
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20"
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50">
            <Globe className="w-5 h-5 mr-3" />
            Domains
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50">
            <BarChart3 className="w-5 h-5 mr-3" />
            Analytics
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-50">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
        </div>
      </nav>
      
      {user && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
