import { useState } from 'react';

interface Props {
  confirmWord: string;
  label: string;
  onConfirm: () => void;
  busy: boolean;
  danger?: boolean;
}

export function TypeToConfirmButton({ confirmWord, label, onConfirm, busy, danger }: Props) {
  const [input, setInput] = useState('');
  const matches = input.trim() === confirmWord;

  return (
    <div className="type-confirm">
      <input
        className="type-confirm-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Type ${confirmWord} to confirm`}
        disabled={busy}
      />
      <button
        className={danger ? 'btn btn-danger' : 'btn btn-primary'}
        disabled={!matches || busy}
        onClick={() => {
          onConfirm();
          setInput('');
        }}
      >
        {busy ? 'Working…' : label}
      </button>
    </div>
  );
}
