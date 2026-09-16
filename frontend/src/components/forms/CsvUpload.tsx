import { useState } from 'react';

interface Props {
  onParse: (raw: string) => void;
}

export function CsvUpload({ onParse }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Only .csv files accepted.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File exceeds 2 MB limit.');
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.trim().length === 0) {
        setError('File is empty.');
        return;
      }
      onParse(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="terminal-border p-4">
      <p className="section-title">CSV UPLOAD</p>

      <label className="block mb-2">
        <span className="btn-terminal cursor-pointer text-[11px]">
          SELECT FILE
        </span>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] as File)}
        />
      </label>

      {error && (
        <p className="text-[11px] text-[var(--critical)] mt-1">> {error}</p>
      )}

      <p className="text-[10px] text-[var(--dim)] mt-2">
        Expected: Object ID, Name, Latitude, Longitude, Altitude, Inclination, Period, RAAN
      </p>
    </div>
  );
}
