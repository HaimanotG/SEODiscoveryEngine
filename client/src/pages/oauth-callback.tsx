import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function OAuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Exchange code for tokens
        const response = await fetch("/api/auth/cloudflare/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            userEmail: "user@example.com", // In a real app, this would come from OAuth
            userName: "User Name", // In a real app, this would come from OAuth
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "OAuth callback failed");
        }

        const data = await response.json();
        
        // Store authentication data
        authService.setAuth({
          token: data.token,
          user: data.user,
        });

        toast({
          title: "Successfully connected!",
          description: "Your Cloudflare account has been connected.",
        });

        // Redirect to dashboard
        setLocation("/dashboard");
      } catch (error) {
        console.error("OAuth callback error:", error);
        
        toast({
          title: "Connection failed",
          description: error instanceof Error ? error.message : "Failed to connect to Cloudflare",
          variant: "destructive",
        });

        // Redirect back to landing page
        setTimeout(() => setLocation("/"), 2000);
      }
    };

    handleOAuthCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl font-semibold text-gray-900">Connecting to Cloudflare</h1>
            <p className="text-sm text-gray-600 text-center">
              Please wait while we set up your account and configure your domains...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
