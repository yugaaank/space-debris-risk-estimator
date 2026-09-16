import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';

interface SatelliteFormProps {
  onClose?: () => void;
}

export function SatelliteForm({ onClose }: SatelliteFormProps) {
  const { satellite, setSatellite } = useSimulationStore();
  const [form, setForm] = useState({ ...satellite });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'object_id' || name === 'name' ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.altitude_km <= 0) { setError('Altitude must be positive'); return; }
    if (form.altitude_km > 50000) { setError('Altitude too high (max 50000 km)'); return; }
    setError('');
    setSatellite({ ...form, object_type: 'SATELLITE' });
    onClose?.();
  };

  const fields: { key: keyof typeof form; label: string; unit: string; min: number; max: number; step: number }[] = [
    { key: 'altitude_km', label: 'Altitude', unit: 'km', min: 100, max: 50000, step: 1 },
    { key: 'inclination_deg', label: 'Inclination', unit: '°', min: 0, max: 180, step: 0.1 },
    { key: 'phase_deg', label: 'Initial Phase (θ₀)', unit: '°', min: 0, max: 359.9, step: 0.1 },
    { key: 'raan_deg', label: 'RAAN (Ω)', unit: '°', min: 0, max: 359.9, step: 0.1 },
    { key: 'eccentricity', label: 'Eccentricity', unit: '', min: 0, max: 0.99, step: 0.001 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {(['object_id', 'name'] as const).map(key => (
          <div key={key}>
            <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-wider">{key === 'object_id' ? 'ID' : 'Name'}</label>
            <input
              name={key}
              value={form[key] as string}
              onChange={handleChange}
              className="w-full bg-gray-900/60 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>
      {fields.map(({ key, label, unit, min, max, step }) => (
        <div key={key}>
          <label className="block text-xs text-gray-400 font-mono mb-1 uppercase tracking-wider">
            {label} {unit && <span className="text-gray-600">({unit})</span>}
          </label>
          <input
            type="number"
            name={key}
            value={form[key] as number}
            onChange={handleChange}
            min={min} max={max} step={step}
            className="w-full bg-gray-900/60 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      <button type="submit" className="btn-primary w-full">Apply Satellite Parameters</button>
    </form>
  );
}
