import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { api } from '@/store/api';
import { FormPanel, messageOf } from '@/views/FormPanel';

const text = (data: FormData, key: string) => String(data.get(key) ?? '');
const columns = 'grid items-start gap-6 md:grid-cols-[minmax(16rem,1fr)_2fr]';
const Records = ({title, loading, error, children, empty}: {title: string; loading: boolean; error: boolean; children: ReactNode; empty: boolean}) =>
  <section className="panel"><h2>{title}</h2>{loading ? <p>Cargando…</p> : error ? <p role="alert">No se pudo cargar el registro. Recarga la página.</p> : empty ? <p>Todavía no hay registros.</p> : <ul>{children}</ul>}</section>;

export const Clients = () => {
  const list = api.useClientsQuery();
  const [add] = api.useAddClientMutation();
  return <><h1>Clientes</h1><div className={columns}><FormPanel title="Registrar cliente" action="Guardar cliente"
    save={data => add({ name: text(data,'name'), phone: text(data,'phone') }).unwrap()}>
    <label>Nombre<input name="name" autoComplete="name" maxLength={120} required /></label>
    <label>Teléfono<input name="phone" type="tel" autoComplete="tel" maxLength={32} required /></label>
  </FormPanel><Records title="Directorio" loading={list.isLoading} error={list.isError} empty={!list.data?.length}>
    {list.data?.map(client => <li key={client.id}><strong>{client.name}</strong><p>{client.phone}</p></li>)}
  </Records></div></>;
};

export const Vehicles = () => {
  const clients = api.useClientsQuery();
  const list = api.useVehiclesQuery();
  const [add] = api.useAddVehicleMutation();
  return <><h1>Vehículos</h1><div className={columns}><FormPanel title="Registrar vehículo" action="Guardar vehículo"
    save={data => add({ model: text(data,'model'), clientId: Number(data.get('clientId')) }).unwrap()}>
    <label>Propietario<select name="clientId" defaultValue="" required><option value="">Seleccionar cliente</option>
      {clients.data?.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
    </select></label><Link to="/clientes">Registrar un cliente</Link>
    <label>Marca y modelo<input name="model" maxLength={100} required /></label>
  </FormPanel><Records title="Vehículos registrados" loading={list.isLoading} error={list.isError || clients.isError} empty={!list.data?.length}>
    {list.data?.map(v => <li key={v.id}><strong>{v.model}</strong><p>{v.owner} · #{v.id}</p></li>)}
  </Records></div></>;
};

export const Agenda = () => {
  const vehicles = api.useVehiclesQuery();
  const list = api.useAppointmentsQuery();
  const [reserve] = api.useReserveMutation();
  const [cancel, cancelling] = api.useCancelMutation();
  const [notice, setNotice] = useState('');
  const cancelAppointment = async (id: number) => {
    if (!window.confirm('¿Cancelar esta cita y liberar el horario?')) return;
    try { await cancel(id).unwrap(); setNotice('Cita cancelada.'); }
    catch (error) { setNotice(messageOf(error)); }
  };
  return <><h1>Agenda del taller</h1><div className={columns}><FormPanel title="Reservar cita" action="Confirmar reserva"
    save={data => reserve({ vehicleId: Number(data.get('vehicleId')), reason: text(data,'reason'),
      startsAt: new Date(text(data,'start')).toISOString() }).unwrap()}>
    <label>Vehículo<select name="vehicleId" defaultValue="" required><option value="">Seleccionar vehículo</option>
      {vehicles.data?.map(v => <option key={v.id} value={v.id}>{v.model} · {v.owner} · #{v.id}</option>)}
    </select></label><Link to="/vehiculos">Registrar un vehículo</Link>
    <label>Inicio · hora local<input type="datetime-local" name="start" step="1800" required /></label>
    <label>Motivo<textarea name="reason" maxLength={300} required /></label>
  </FormPanel><section><Records title="Citas registradas" loading={list.isLoading} error={list.isError || vehicles.isError} empty={!list.data?.length}>
    {list.data?.map(a => <li key={a.id}><strong>{a.model} · {a.owner}</strong>
      <p>{new Date(a.startsAt).toLocaleString('es-DO')} · {a.status === 'reserved' ? 'Reservada' : 'Cancelada'}</p>
      <p>{a.reason}</p>{a.status === 'reserved' && <button className="secondary" disabled={cancelling.isLoading} onClick={() => cancelAppointment(a.id)}>Cancelar cita</button>}
    </li>)}</Records><p role="status">{notice}</p></section></div></>;
};
