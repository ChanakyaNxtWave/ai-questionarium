import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import QuestionGeneration from "@/pages/QuestionGeneration";
import Auth from "@/pages/Auth";
import PromptManagement from "@/pages/PromptManagement";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Index />} />
        <Route
          path="/prompts"
          element={
            <ProtectedRoute>
              <PromptManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/generate/:language" element={<QuestionGeneration />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;