import { useRef, useState } from 'react';
import apiClient from '../../api/client';
import type { OrbitalObjectInput } from '../../types';

interface Props {
  onLoaded: (objects: OrbitalObjectInput[]) => void;
}

export function CsvUpload({ onLoaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus('error');
      setMessage('Only CSV files are accepted');
      return;
    }
    setStatus('loading');
    setMessage('Parsing...');
    try {
      const result = await apiClient.uploadDebris(file);
      if (result.errors.length > 0) {
        setStatus('error');
        setMessage(`Parsed ${result.parsed} objects. ${result.errors.length} errors:\n${result.errors.map((e: any) => `Row ${e.row}: ${e.error}`).join('\n')}`);
      } else {
        setStatus('success');
        setMessage(`✓ Loaded ${result.parsed} debris objects`);
        onLoaded(result.objects);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragging ? 'border-blue-400 bg-blue-900/10' : 'border-gray-700 hover:border-gray-500'}`}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <p className="text-gray-400 text-sm font-mono">📂 Drop CSV file or click to browse</p>
        <p className="text-gray-600 text-xs font-mono mt-1">Required columns: object_id, name, altitude_km, inclination_deg</p>
        <p className="text-gray-600 text-xs font-mono">Optional: phase_deg, raan_deg, eccentricity</p>
      </div>
      {message && (
        <div className={`rounded px-3 py-2 text-xs font-mono whitespace-pre-wrap ${status === 'success' ? 'bg-green-900/20 text-green-400 border border-green-700/30' : status === 'error' ? 'bg-red-900/20 text-red-400 border border-red-700/30' : 'bg-blue-900/10 text-blue-300'}`}>
          {status === 'loading' && <span className="animate-pulse">⟳ </span>}
          {message}
        </div>
      )}
    </div>
  );
}
