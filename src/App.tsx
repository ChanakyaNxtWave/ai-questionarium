
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionGeneration from "./pages/QuestionGeneration";
import { VariantsDisplay } from "./pages/VariantsDisplay";
import Index from "./pages/Index";
import { Navbar } from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/generate/:language" element={<QuestionGeneration />} />
            <Route path="/generate/:language/:unitTitle" element={<VariantsDisplay />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
