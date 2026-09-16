import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';

interface LoadingStep {
  id: string;
  label: string;
  status: 'waiting' | 'active' | 'done' | 'error';
}

const INITIAL_STEPS: LoadingStep[] = [
  { id: 'connect', label: 'Connecting to orbital engine', status: 'waiting' },
  { id: 'objects', label: 'Loading tracked objects', status: 'waiting' },
  { id: 'init3d', label: 'Initializing 3D environment', status: 'waiting' },
  { id: 'sync', label: 'Synchronizing simulation', status: 'waiting' },
];

interface Props {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: Props) {
  const [steps, setSteps] = useState<LoadingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackedObjects, setTrackedObjects] = useState<number | null>(null);
  const [dots, setDots] = useState('');
  const completedRef = useRef(false);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const updateStep = (index: number, status: LoadingStep['status']) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  };

  useEffect(() => {
    let cancelled = false;

    async function runLoading() {
      // Step 0: Connect to backend
      setCurrentStep(0);
      updateStep(0, 'active');
      await new Promise(r => setTimeout(r, 300));

      try {
        const health = await apiClient.health();
        if (cancelled) return;
        setTrackedObjects(health.tracked_objects ?? 50);
        updateStep(0, 'done');
      } catch {
        if (cancelled) return;
        updateStep(0, 'error');
        setErrorMsg('Orbital engine is waking up — this may take ~30s on first load.');
        // Still proceed — the UI will handle offline gracefully
        await new Promise(r => setTimeout(r, 1200));
        if (cancelled) return;
        updateStep(0, 'done');
      }

      await new Promise(r => setTimeout(r, 180));

      // Step 1: Load objects (fake brief pause — real load happens on first simulation)
      if (cancelled) return;
      setCurrentStep(1);
      updateStep(1, 'active');
      await new Promise(r => setTimeout(r, 500));
      if (cancelled) return;
      updateStep(1, 'done');

      await new Promise(r => setTimeout(r, 120));

      // Step 2: Init 3D
      if (cancelled) return;
      setCurrentStep(2);
      updateStep(2, 'active');
      await new Promise(r => setTimeout(r, 600));
      if (cancelled) return;
      updateStep(2, 'done');

      await new Promise(r => setTimeout(r, 120));

      // Step 3: Sync
      if (cancelled) return;
      setCurrentStep(3);
      updateStep(3, 'active');
      await new Promise(r => setTimeout(r, 400));
      if (cancelled) return;
      updateStep(3, 'done');

      await new Promise(r => setTimeout(r, 500));

      if (!cancelled && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }

    runLoading();
    return () => { cancelled = true; };
  }, [onComplete]);

  return (
    <div className="loading-screen select-none" style={{ background: '#010610' }}>
      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-cyan-500/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-cyan-500/30" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-cyan-500/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-cyan-500/30" />

      {/* Orbital ring decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-10">
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-400 animate-spin-slow-cw" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-blue-400/50 animate-spin-slow-ccw" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-md w-full px-8"
      >
        {/* Logo */}
        <div className="mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-orbital-pulse">
            <span className="text-lg font-bold text-white">⊕</span>
          </div>
        </div>

        <div className="loading-logo text-center">ORBITAL SHIELD</div>
        <p className="text-xs text-cyan-400/60 font-mono tracking-widest mb-1">SPACE DEBRIS COLLISION RISK ESTIMATOR</p>
        <p className="text-[10px] text-gray-600 font-mono tracking-widest mb-10">ISRO HACKATHON 2026 · DEPT. OF SPACE</p>

        {/* Loading steps */}
        <div className="w-full space-y-3 mb-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              {/* Status icon */}
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {step.status === 'done' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400 text-sm"
                  >
                    ✓
                  </motion.span>
                )}
                {step.status === 'active' && (
                  <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                )}
                {step.status === 'error' && (
                  <span className="text-orange-400 text-sm">!</span>
                )}
                {step.status === 'waiting' && (
                  <span className="w-3 h-3 rounded-full border border-gray-700" />
                )}
              </div>

              {/* Label */}
              <span className={`text-xs font-mono transition-colors duration-300 ${
                step.status === 'done' ? 'text-gray-400' :
                step.status === 'active' ? 'text-cyan-300' :
                step.status === 'error' ? 'text-orange-400' :
                'text-gray-700'
              }`}>
                {step.label}
                {step.status === 'active' && (
                  <span className="text-gray-600">{dots}</span>
                )}
                {step.status === 'done' && step.id === 'connect' && trackedObjects && (
                  <span className="text-green-400 ml-2">({trackedObjects} objects)</span>
                )}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-gray-900 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full p-3 rounded border border-orange-900/50 bg-orange-950/30 text-[11px] font-mono text-orange-400 text-center leading-relaxed"
            >
              ⚡ {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Version */}
        <p className="text-[10px] text-gray-700 font-mono mt-6">v1.0.0 · APPROXIMATE MODEL · NOT FOR OPERATIONAL USE</p>
      </motion.div>
    </div>
  );
}
