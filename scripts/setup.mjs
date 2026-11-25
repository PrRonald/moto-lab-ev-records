import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// Genera una clave de operador y conserva cualquier configuración existente.
const key = randomBytes(32).toString('hex');
writeFileSync('.env', 'OPERATOR_KEY=' + key + '\nPORT=3000\n', { flag: 'wx', mode: 0o600 });
console.log('Configuración creada. Consulta OPERATOR_KEY en .env para entrar al taller.');

