import { useEffect, useState } from 'react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}

export function ImageUploader({ files, onChange, max = 3 }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const combined = [...files, ...picked].slice(0, max);
    onChange(combined);
    e.target.value = '';
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="image-uploader">
      <div className="image-preview-row">
        {previews.map((src, i) => (
          <div className="image-preview" key={i}>
            <img src={src} alt={`Photo ${i + 1}`} />
            <button type="button" className="image-remove" onClick={() => removeAt(i)} aria-label="Remove photo">
              ×
            </button>
          </div>
        ))}
        {files.length < max && (
          <label className="image-add-tile">
            <input type="file" accept="image/*" capture="environment" multiple onChange={handlePick} hidden />
            + Photo
          </label>
        )}
      </div>
      <p className="hint-text">
        {files.length}/{max} photos
      </p>
    </div>
  );
}
