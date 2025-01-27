import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QuestionGeneration from "./pages/QuestionGeneration";
import ClassroomVariants from "./pages/ClassroomVariants";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/generate/:language" element={<QuestionGeneration />} />
        <Route path="/generate/sql/:unitTitle" element={<ClassroomVariants />} />
      </Routes>
    </Router>
  );
}

export default App;