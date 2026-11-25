// Transporta un error previsto hasta el manejador HTTP.
export const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};

// Acepta únicamente los campos definidos para cada operación.
export const fields = (body, allowed) => {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !allowed.includes(key))) fail(400, 'Campos inválidos.');
};

// Normaliza texto obligatorio y limita el espacio que puede ocupar.
export const requiredText = (value, max) => {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(400, 'Texto inválido.');
  return value.trim();
};

// Comprueba identificadores antes de consultar la base.
export const identifier = (value) => {
  if (!Number.isSafeInteger(value) || value < 1) fail(400, 'Identificador inválido.');
  return value;
};

