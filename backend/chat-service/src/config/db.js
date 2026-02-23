import pgPromiseLib from 'pg-promise';
import fs from 'fs';

const initOptions = {};
const pgp = pgPromiseLib(initOptions);

const dbName = fs.readFileSync('/run/secrets/psql_dbname', 'utf8').trim();
const dbUser = 'chat_user';
// const dbPassword = fs.readFileSync('/run/secrets/psql_chat_passwd', 'utf8').trim();
const dbPassword = fs.readFileSync('/run/secrets/psql_services_passwd', 'utf8').trim();

const connectionString = `postgres://${dbUser}:${dbPassword}@db:5432/${dbName}`;
const db = pgp(connectionString);

export { db };