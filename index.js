require('dotenv').config();

const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const knex = require('./db');

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.log(`Redis error: ${err}`);
});

knex.raw('select 1+1 as result')
  .then(() => {
    console.log('MySQL connected');
  })
  .catch(err => {
    console.log(`MySQL error: ${err}`);
  });

const app = require('./app');
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running on port ${server.address().port}`)
});