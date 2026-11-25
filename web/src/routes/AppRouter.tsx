import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';
import { Shell } from '@/views/Shell';
import { Clients, Vehicles, Agenda } from '@/views/Workshop';
import { ErrorPage, NotFound } from '@/views/ErrorPage';

export const routes: RouteObject[] = [
  { path: '/', Component: Shell, ErrorBoundary: ErrorPage, children: [
    { index: true, Component: Agenda },
    { path: 'clientes', Component: Clients },
    { path: 'vehiculos', Component: Vehicles }
  ] },
  { path: '*', Component: NotFound }
];
const router = createBrowserRouter(routes);
export const AppRouter = () => <RouterProvider router={router} />;
