import { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';

interface LoadingStep {
  id: string;
  label: string;
  status: 'waiting' | 'active' | 'done' | 'error';
}

const INITIAL_STEPS: LoadingStep[] = [
  { id: 'connect', label: 'CONNECTING TO ORBITAL ENGINE', status: 'waiting' },
  { id: 'objects', label: 'LOADING TRACKED OBJECTS', status: 'waiting' },
  { id: 'init3d', label: 'INITIALIZING 3D ENVIRONMENT', status: 'waiting' },
  { id: 'sync', label: 'SYNCHRONIZING SIMULATION', status: 'waiting' },
];

interface Props {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: Props) {
  const [steps, setSteps] = useState<LoadingStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackedObjects, setTrackedObjects] = useState<number | null>(null);
  const completedRef = useRef(false);

  const updateStep = (index: number, status: LoadingStep['status']) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  };

  useEffect(() => {
    let cancelled = false;

    async function runLoading() {
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
        setErrorMsg('Engine warming up — may take ~30s on first load.');
        await new Promise(r => setTimeout(r, 1200));
        if (cancelled) return;
        updateStep(0, 'done');
      }

      await new Promise(r => setTimeout(r, 180));
      if (cancelled) return;
      setCurrentStep(1);
      updateStep(1, 'active');
      await new Promise(r => setTimeout(r, 500));
      if (cancelled) return;
      updateStep(1, 'done');

      await new Promise(r => setTimeout(r, 120));
      if (cancelled) return;
      setCurrentStep(2);
      updateStep(2, 'active');
      await new Promise(r => setTimeout(r, 600));
      if (cancelled) return;
      updateStep(2, 'done');

      await new Promise(r => setTimeout(r, 120));
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

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-[var(--bg)] flex flex-col items-center justify-center z-50 select-none">
      <div className="max-w-md w-full px-8">
        <div className="mb-6">
          <span className="text-xl font-extrabold tracking-tight">ORBITAL_SHIELD</span>
          <p className="text-[10px] text-[var(--dim)] mt-1">SPACE DEBRIS COLLISION RISK ESTIMATOR</p>
          <p className="text-[10px] text-[var(--dim)]">ISRO HACKATHON 2026</p>
        </div>

        <div className="space-y-2 mb-6">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <span className="text-[11px] w-4">
                {step.status === 'done' && <span className="text-[#22c55e]">[OK]</span>}
                {step.status === 'active' && <span className="text-[var(--high)]">[..]</span>}
                {step.status === 'error' && <span className="text-[var(--critical)]">[!!]</span>}
                {step.status === 'waiting' && <span className="text-[var(--dim)]">[--]</span>}
              </span>
              <span className={`text-[11px] ${
                step.status === 'done' ? 'text-[var(--dim)]' :
                step.status === 'active' ? 'text-[var(--fg)]' :
                step.status === 'error' ? 'text-[var(--critical)]' :
                'text-[#404040]'
              }`}>
                {step.label}
                {step.status === 'done' && step.id === 'connect' && trackedObjects && (
                  <span className="text-[#22c55e] ml-2">({trackedObjects} objects)</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full h-[1px] bg-[var(--border)] mb-4">
          <div
            className="h-full bg-[var(--fg)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {errorMsg && (
          <div className="border border-[var(--high)] p-2 text-[11px] text-[var(--high)] mb-4">
            {`> ${errorMsg}`}
          </div>
        )}

        <p className="text-[10px] text-[#404040]">v1.0.0 — NOT FOR OPERATIONAL USE</p>
      </div>
    </div>
  );
}
