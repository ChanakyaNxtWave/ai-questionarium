import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QuestionGeneration from "./pages/QuestionGeneration";
import GeneratedQuestions from "./pages/GeneratedQuestions";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/generate/:language" element={<QuestionGeneration />} />
        <Route path="/questions/:language/:unitTitle" element={<GeneratedQuestions />} />
      </Routes>
    </Router>
  );
}

export default App;