import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ProductType } from '../types';

interface Props {
  value: string;
  onChange: (typeId: string) => void;
}

export function TypeSelect({ value, onChange }: Props) {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrefix, setNewPrefix] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadTypes() {
    const { data } = await supabase.from('product_types').select('id, name, prefix').order('name');
    setTypes(data ?? []);
  }

  useEffect(() => {
    loadTypes();
  }, []);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === '__new__') {
      setAdding(true);
      return;
    }
    onChange(e.target.value);
  }

  async function handleCreateType() {
    setError(null);
    if (!newName.trim() || !/^[A-Za-z0-9]{2,4}$/.test(newPrefix.trim())) {
      setError('Type name required; code must be 2-4 letters/numbers.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.rpc('create_product_type', {
      p_name: newName.trim(),
      p_prefix: newPrefix.trim().toUpperCase(),
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    await loadTypes();
    onChange(data.id);
    setAdding(false);
    setNewName('');
    setNewPrefix('');
  }

  if (adding) {
    return (
      <div className="inline-add-type">
        <label>
          New type name
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Shirts" />
        </label>
        <label>
          Code (2-4 letters)
          <input
            value={newPrefix}
            onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
            placeholder="e.g. SHT"
            maxLength={4}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <div className="inline-add-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleCreateType}>
            {saving ? 'Saving…' : 'Add Type'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <select value={value} onChange={handleSelect} required>
      <option value="" disabled>
        Select type…
      </option>
      {types.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
      <option value="__new__">+ Add new type…</option>
    </select>
  );
}
