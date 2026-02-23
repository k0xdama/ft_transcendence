// const	express = require("express");
// const	app = express();
// const	initOptions = {};
// const	pgPromiseLib = require("pg-promise");
// const	pgp = pgPromiseLib(initOptions);
// const	fs = require('fs');

// const	dbName = fs.readFileSync('/run/secrets/psql_dbname', 'utf8').trim();
// const	dbUser = 'player_user';
// const	dbPassword = fs.readFileSync('/run/secrets/psql_services_passwd', 'utf8').trim();
// const	connectionString = `postgres://${dbUser}:${dbPassword}@db:5432/${dbName}`;
// const	db = pgp(connectionString);
// pas besoin de au dessus car player-service/src/db/queries creer deja bd comme dans la ligne ci-dessus
// const	port = 2000;

// app.listen(port, () => {
// 	console.log(`Player service running on port ${port}`);
// });

//SON TRUC
import express from 'express';
import playerRoutes from './src/routes/player.js';

const app = express();

app.use(express.json());

app.use('/player', playerRoutes);

const port = 3001;

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, '0.0.0.0', () => {
		console.log(`Player service running on ${port}`);
	});
}

export default app;
//SON TRUC




// MON TRUC
// import	express			from	'express';
// import	playerRoutes	from	'./src/routes/player.js';

// const	app	= express();
// app.use(express.json());
// app.use('/player', playerRoutes);

// app.listen(3001, () => {
// 	console.log('player service running on port 3001');
// });
// MON TRUC