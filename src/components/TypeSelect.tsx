import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ProductCategory, ProductType } from '../types';

interface Props {
  value: string;
  onChange: (typeId: string) => void;
}

export function TypeSelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [types, setTypes] = useState<ProductType[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('product_categories')
      .select('id, name, sort_order')
      .order('sort_order')
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setTypes([]);
      return;
    }
    supabase
      .from('product_types')
      .select('id, name, prefix, category_id')
      .eq('category_id', categoryId)
      .order('name')
      .then(({ data }) => setTypes(data ?? []));
  }, [categoryId]);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategoryId(e.target.value);
    setAdding(false);
    onChange('');
  }

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === '__new__') {
      setAdding(true);
      return;
    }
    onChange(e.target.value);
  }

  async function handleCreateType() {
    setError(null);
    if (!newName.trim()) {
      setError('Sub type name is required.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.rpc('create_product_type', {
      p_name: newName.trim(),
      p_category_id: categoryId,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    const { data: refreshed } = await supabase
      .from('product_types')
      .select('id, name, prefix, category_id')
      .eq('category_id', categoryId)
      .order('name');
    setTypes(refreshed ?? []);
    onChange(data.id);
    setAdding(false);
    setNewName('');
  }

  return (
    <div className="type-select">
      <select value={categoryId} onChange={handleCategoryChange} required>
        <option value="" disabled>
          Select category…
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {categoryId &&
        (adding ? (
          <div className="inline-add-type">
            <label>
              New sub type name
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Kalamkari Cotton Sarees" />
            </label>
            <p className="hint-text">Its product code is generated automatically.</p>
            {error && <p className="error-text">{error}</p>}
            <div className="inline-add-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleCreateType}>
                {saving ? 'Saving…' : 'Add Sub Type'}
              </button>
            </div>
          </div>
        ) : (
          <select value={value} onChange={handleTypeChange} required>
            <option value="" disabled>
              Select sub type…
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            <option value="__new__">+ Add new sub type…</option>
          </select>
        ))}
    </div>
  );
}
