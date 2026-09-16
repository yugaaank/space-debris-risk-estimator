import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SimulationPage } from './pages/SimulationPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ObjectsPage } from './pages/ObjectsPage';
import { MethodologyPage } from './pages/MethodologyPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#020813] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/risk" element={<RiskAnalysisPage />} />
            <Route path="/objects" element={<ObjectsPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
