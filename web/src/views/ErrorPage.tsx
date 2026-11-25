import { isRouteErrorResponse, useRouteError } from 'react-router';

export const NotFound = () => <main className="panel mx-auto mt-16 max-w-lg"><h1>404 · Página desconocida</h1><p>Revisa la dirección o vuelve al registro del taller.</p><a href="/">Volver a la agenda</a></main>;

export const ErrorPage = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return <main className="panel mx-auto mt-16 max-w-lg"><h1>No se pudo abrir la página</h1><p>Vuelve a cargar la agenda para reintentar.</p><a href="/">Abrir agenda</a></main>;
};
