const	express = require("express");
const	app = express();
const	initOptions = {};
const	pgPromiseLib = require("pg-promise");
const	pgp = pgPromiseLib(initOptions);

const	fs = require('fs');
const	dbName = fs.readFileSync('/run/secrets/psql_dbname', 'utf8').trim();
const	dbUser = fs.readFileSync('/run/secrets/psql_admin_user', 'utf8').trim();
const	dbPassword = fs.readFileSync('/run/secrets/psql_admin_passwd', 'utf8').trim();
const	connectionString = `postgres://${dbUser}:${dbPassword}@db:5432/${dbName}`;
const	db = pgp(connectionString);
const	port = 2000;

app.listen(port, () => {
	console.log(`Player service running on port ${port}`);
});
