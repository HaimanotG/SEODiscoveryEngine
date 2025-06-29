import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Bot, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { useEffect } from "react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { status } = useConnectionStatus();

  useEffect(() => {
    if (status === "connected") {
      setLocation("/dashboard");
    }
  }, [status, setLocation]);

  const handleCloudflareOAuth = () => {
    window.location.href = "/api/auth/cloudflare";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SEO Discoverly</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900 font-medium">
                Documentation
              </a>
              <Button variant="default">Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Make Your Website{" "}
              <span className="text-primary">AI-Discoverable</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Enterprise-grade platform that automatically generates Schema.org JSON-LD data using AI,
              making your content fully visible to search engines and AI crawlers in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleCloudflareOAuth}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg h-auto flex items-center space-x-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.16 12.18c-.06-.75-.12-1.5-.25-2.23-.06-.38-.44-.63-.81-.63H6.9c-.38 0-.75.25-.81.63-.13.73-.19 1.48-.25 2.23-.06.81.56 1.44 1.37 1.44h11.58c.81 0 1.43-.63 1.37-1.44z"/>
                </svg>
                <span>Connect with Cloudflare</span>
              </Button>
              <Button variant="outline" className="px-8 py-4 text-lg h-auto">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built for scale with enterprise-grade security and reliability
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Edge Processing</h3>
                <p className="text-gray-600">
                  Cloudflare Workers inject Schema.org data in real-time with zero latency impact
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Advanced LLM integration generates accurate structured data automatically
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
                <p className="text-gray-600">
                  Bank-grade encryption and secure OAuth2 integration with Cloudflare
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
