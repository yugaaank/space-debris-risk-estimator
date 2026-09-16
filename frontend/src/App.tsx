import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { SimulationPage } from './pages/SimulationPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ObjectsPage } from './pages/ObjectsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { LoadingScreen } from './components/layout/LoadingScreen';

function App() {
  const [showLoading, setShowLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('orbital_shield_intro_shown');
    } catch {
      return false;
    }
  });

  const handleLoadingComplete = () => {
    try {
      sessionStorage.setItem('orbital_shield_intro_shown', 'true');
    } catch {
      // ignore
    }
    setShowLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {showLoading && (
          <motion.div
            key="loading-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-50"
          >
            <LoadingScreen onComplete={handleLoadingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}

export default App;
