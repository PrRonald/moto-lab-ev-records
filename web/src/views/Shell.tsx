import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { api } from '@/store/api';
import { store } from '@/store';
import { FormPanel, messageOf } from '@/views/FormPanel';

export const Shell = () => {
  const session = api.useSessionQuery(undefined, { refetchOnMountOrArgChange: true });
  const [login] = api.useLoginMutation();
  const [logout] = api.useLogoutMutation();
  const [notice, setNotice] = useState('');
  if (session.isLoading) return <main>Abriendo el taller…</main>;
  if (session.isError && !('status' in session.error && session.error.status === 401))
    return <main><p>No se pudo conectar con el taller.</p><button onClick={() => session.refetch()}>Reintentar</button></main>;
  if (!session.data || session.isError) return <main className="mx-auto mt-16 max-w-md">
    <h1>Moto Lab EV</h1><FormPanel title="Acceso al taller" action="Entrar" save={data => login(String(data.get('key'))).unwrap()}>
      <label>Clave de operador<input name="key" type="password" autoComplete="current-password" required /></label>
    </FormPanel></main>;
  const leave = async () => {
    try { await logout().unwrap(); store.dispatch(api.util.resetApiState()); }
    catch (error) { setNotice(messageOf(error)); }
  };
  return <><header><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
    <strong>Moto Lab EV</strong><nav aria-label="Principal">
      <NavLink to="/" end>Agenda</NavLink><NavLink to="/clientes">Clientes</NavLink><NavLink to="/vehiculos">Vehículos</NavLink>
    </nav><button onClick={leave}>Salir</button></div></header>
    <main className="mx-auto max-w-6xl"><span role="status">{notice}</span><Outlet /></main></>;
};
