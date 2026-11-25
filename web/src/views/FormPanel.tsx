import { useState, type ReactNode, type FormEvent } from 'react';

export const messageOf = (error: unknown) => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (data && typeof data === 'object' && 'message' in data) return String(data.message);
  }
  return 'No se pudo completar la operación. Comprueba la conexión.';
};

type Props = { title: string; action: string; children: ReactNode; save: (data: FormData) => Promise<unknown> };
export const FormPanel = ({title, action, children, save}: Props) => {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setNotice('');
    try {
      await save(new FormData(form));
      form.reset();
      setNotice('Guardado.');
    } catch (error) { setNotice(messageOf(error)); }
    finally { setBusy(false); }
  };
  return <form className="panel grid content-start gap-4" onSubmit={submit}>
    <h2>{title}</h2>{children}<button disabled={busy}>{busy ? 'Procesando…' : action}</button>
    <span role="status">{notice}</span>
  </form>;
};
