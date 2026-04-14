import fs from 'fs';

export const JWT_SIGNING_KEY = fs.readFileSync('/run/secrets/jwt_signing_key', 'utf8').trim();