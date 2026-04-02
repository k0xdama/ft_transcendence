import fs from 'fs';

export const JWT_SECRET = fs.readFileSync('/run/secrets/jwt_access', 'utf8').trim();