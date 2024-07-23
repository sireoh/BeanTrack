import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DoesNotExist from "./pages/DoesNotExist";

// App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<DoesNotExist />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;