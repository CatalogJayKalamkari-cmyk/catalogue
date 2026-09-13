import { useEffect, useState } from 'react';

export interface ImageEntry {
  file: File;
  color: string;
  quantity: string;
}

interface Props {
  entries: ImageEntry[];
  onChange: (entries: ImageEntry[]) => void;
  max?: number;
  showColorInput?: boolean;
}

export function ImageUploader({ entries, onChange, max = 10, showColorInput = false }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = entries.map((e) => URL.createObjectURL(e.file));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [entries]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).map((file) => ({ file, color: '', quantity: '1' }));
    const combined = [...entries, ...picked].slice(0, max);
    onChange(combined);
    e.target.value = '';
  }

  function removeAt(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function setColorAt(index: number, color: string) {
    onChange(entries.map((e, i) => (i === index ? { ...e, color } : e)));
  }

  function setQuantityAt(index: number, quantity: string) {
    onChange(entries.map((e, i) => (i === index ? { ...e, quantity } : e)));
  }

  return (
    <div className="image-uploader">
      <div className="image-preview-row">
        {entries.map((entry, i) => (
          <div className="image-preview-item" key={i}>
            <div className="image-preview">
              <img src={previews[i]} alt={`Photo ${i + 1}`} />
              <button type="button" className="image-remove" onClick={() => removeAt(i)} aria-label="Remove photo">
                ×
              </button>
            </div>
            {showColorInput && (
              <>
                <input
                  className="image-color-input"
                  type="text"
                  placeholder="Color name"
                  value={entry.color}
                  onChange={(e) => setColorAt(i, e.target.value)}
                />
                <input
                  className="image-color-input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Qty"
                  value={entry.quantity}
                  onChange={(e) => setQuantityAt(i, e.target.value)}
                />
              </>
            )}
          </div>
        ))}
        {entries.length < max && (
          <label className="image-add-tile">
            <input type="file" accept="image/*" capture="environment" multiple onChange={handlePick} hidden />
            + Photo
          </label>
        )}
      </div>
      <p className="hint-text">
        {entries.length}/{max} photos
      </p>
    </div>
  );
}
