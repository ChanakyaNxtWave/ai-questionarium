import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import QuestionGeneration from "@/pages/QuestionGeneration";
import Prompts from "@/pages/Prompts";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/generate/:language"
              element={
                <ProtectedRoute>
                  <QuestionGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prompts"
              element={
                <ProtectedRoute>
                  <Prompts />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;