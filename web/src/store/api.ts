import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Client = { id: number; name: string; phone: string };
export type Vehicle = { id: number; clientId: number; model: string; owner: string };
export type Appointment = { id: number; vehicleId: number; model: string; owner: string; reason: string; startsAt: string; status: 'reserved' | 'cancelled' };

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api/', prepareHeaders: headers => { headers.set('X-Workshop-Request','1'); return headers; } }),
  tagTypes: ['Clients','Vehicles','Appointments','Session'],
  endpoints: build => ({
    session: build.query<{authenticated: boolean}, void>({ query: () => 'auth/session', providesTags: ['Session'] }),
    login: build.mutation<void, string>({ query: key => ({ url: 'auth/login', method: 'POST', body: { key } }), invalidatesTags: ['Session'] }),
    logout: build.mutation<void, void>({ query: () => ({ url: 'auth/logout', method: 'POST' }) }),
    clients: build.query<Client[], void>({ query: () => 'clients', providesTags: ['Clients'] }),
    addClient: build.mutation<{id: number}, Omit<Client,'id'>>({ query: body => ({url:'clients', method:'POST', body}), invalidatesTags:['Clients'] }),
    vehicles: build.query<Vehicle[], void>({ query: () => 'vehicles', providesTags: ['Vehicles'] }),
    addVehicle: build.mutation<{id: number}, Pick<Vehicle,'clientId'|'model'>>({ query: body => ({url:'vehicles', method:'POST',body}), invalidatesTags:['Vehicles'] }),
    appointments: build.query<Appointment[], void>({ query: () => 'appointments', providesTags:['Appointments'] }),
    reserve: build.mutation<{id: number}, Pick<Appointment,'vehicleId'|'startsAt'|'reason'>>({ query: body => ({url:'appointments', method:'POST',body}), invalidatesTags:['Appointments'] }),
    cancel: build.mutation<void, number>({ query: id => ({url:'appointments/'+id+'/cancel',method:'POST'}), invalidatesTags:['Appointments'] })
  })
});
