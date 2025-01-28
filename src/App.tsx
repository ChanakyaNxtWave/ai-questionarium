import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionGeneration from "./pages/QuestionGeneration";
import { VariantsDisplay } from "./pages/VariantsDisplay";
import Index from "./pages/Index";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/generate/:language" element={<QuestionGeneration />} />
        <Route path="/generate/:language/:unitTitle" element={<VariantsDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;