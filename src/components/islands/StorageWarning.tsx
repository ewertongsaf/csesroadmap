import { useStorageError } from '../../lib/progress/react.ts';

export default function StorageWarning() {
  const error = useStorageError();
  if (!error) return null;
  return (
    <div role="alert" className="border-b border-danger/40 bg-danger/10 px-4 py-2 text-center text-sm text-danger">
      {error} O progresso desta sessão fica só em memória: exporte em <a className="underline" href="/config">Progresso</a> antes de fechar.
    </div>
  );
}
