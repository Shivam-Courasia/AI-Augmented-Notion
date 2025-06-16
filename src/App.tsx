
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AIProvider } from "@/contexts/AIContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";
import WorkspaceGraphPage from "./pages/WorkspaceGraphPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AIProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/workspace" 
                element={
                  <ProtectedRoute>
                    <Workspace />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/workspace/graph"
                element={
                  <ProtectedRoute>
                    <WorkspaceGraphPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AIProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
