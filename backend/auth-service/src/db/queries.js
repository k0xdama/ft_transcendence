import pgPromiseLib from 'pg-promise';
import fs from'fs';

const initOptions = {};
const pgp = pgPromiseLib(initOptions);
const dbName = fs.readFileSync('/run/secrets/psql_dbname', 'utf8').trim();
const dbUser = fs.readFileSync('/run/secrets/psql_auth_user', 'utf8').trim();
const dbPassword = fs.readFileSync('/run/secrets/psql_auth_passwd', 'utf8').trim();
const connectionString = `postgres://${dbUser}:${dbPassword}@db:5432/${dbName}`;
const db = pgp(connectionString);

export { db };