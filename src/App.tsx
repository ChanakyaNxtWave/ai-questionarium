import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QuestionGeneration from "./pages/QuestionGeneration";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/generate/:language" element={<QuestionGeneration />} />
      </Routes>
    </Router>
  );
}

export default App;