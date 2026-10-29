import { useState } from 'react';

export default function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('ok');
    } catch {
      setState('fail');
    }
    setTimeout(() => setState('idle'), 1500);
  };
  return (
    <button type="button" onClick={copy} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg hover:opacity-90">
      {state === 'ok' ? 'Copiado' : state === 'fail' ? 'Falhou: selecione e copie' : label}
    </button>
  );
}
