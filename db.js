require('dotenv').config();

const knex = require('knex')({
  client: process.env.KNEX_CLIENT,
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
  },
  // debug: true
});

module.exports = knex;