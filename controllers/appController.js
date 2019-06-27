require('dotenv').config()

const _ = require('lodash');
const redis = require('redis');
const amqp = require('amqplib');

const knex = require('../db');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const service = {};
const apps = 'tokobesi';

service.getIndexPage = (req, res) => {
  return res.status(200).json({ message: 'Hello world' });
};

service.validateInput = (req, res, next) => {
  req.checkBody('name', 'Item name must be provided').notEmpty();
  req.checkBody('price', 'Price must be provided').notEmpty();
  req.checkBody('price', 'Price must be numeric').isNumeric();
  req.checkBody('price', 'Price must be greater than 0').isInt({ gt: 0 });
  req.checkBody('stock', 'Stock must be provided').notEmpty();
  req.checkBody('stock', 'Stock must be numeric').isNumeric();
  req.checkBody('stock', 'Stock must be greater than 0').isInt({ gt: 0 });
  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ errors });
  }

  next();
};

service.addItem = async (req, res) => {
  const { name, price, stock } = req.body;
  const item = await knex('items').where('name', name);

  if (item.length > 0) {
    return res.status(403).json({
      message: 'Item already exists',
      name
    });
  }

  const [id] = await knex.insert({ name, price, stock }).into('items');
  client.hmset(
    `log-${id}`, [
      'id', id,
      'name', name,
      'price', price,
      'stock', stock,
    ], (error, result) => {
      if (error) {
        return res.status(400).json({
          message: 'Something went wrong',
          error
        });
      }
    },
  );

  return res.status(200).json({
    message: 'Item created',
    result: {
      id,
      name,
      price,
      stock
    }
  });
};

service.getItems = async (req, res) => {
  const items = await knex('items');

  return res.status(200).json({
    result: items
  });
};

service.getItem = async (req, res) => {
  const { id } = req.params;
  const [item] = await knex('items').where('id', id);

  if (item.length < 1) {
    return res.status(404).json({
      message: 'Item not found'
    });
  }

  client.hgetall(`log-${id}`, (error, user) => {
    if (error) {
      return res.status(400).json({
        message: 'Something went wrong',
        error
      });
    }
  });

  return res.status(200).json({
    result: item
  });
};

service.checkItemExists = async (req, res, next) => {
  const { id } = req.params;
  const item = await knex('items').where('id', id);

  if (item.length < 1) {
    return res.status(404).json({
      message: 'Item not found'
    });
  }

  next();
};

service.updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;
  await knex('items').where('id', id).update({
    name,
    price,
    stock
  });
  client.hmset(
    `log-${id}`, [
      'id', id,
      'name', name,
      'price', price,
      'stock', stock,
    ], (error, result) => {
      if (error) {
        return res.status(400).json({
          message: 'Something went wrong',
          error
        });
      }
    },
  );

  return res.status(200).json({
    message: 'Item updated',
    result: {
      id,
      name,
      price,
      stock
    }
  });
};

service.deleteItem = async (req, res) => {
  const { id } = req.params;
  await knex('items').where('id', id).del();

  client.del(`log-${id}`, (error, result) => {
    if (error) {
      return res.status(400).json({
        message: 'Something went wrong',
        error
      });
    }
  });

  return res.status(200).json({
    message: 'Item deleted',
    result: {
      id
    }
  });
};

service.purchaseItem = async (req, res) => {
  const { id: item_id } = req.params;
  const { quantity } = req.body;
  let isOutOfStock = false;

  publisher({ item_id, quantity });
  consumer();

  client.hgetall(`msg-${item_id}`, async (error, msg) => {
    if (error) {
      return res.status(400).json({
        message: 'Something went wrong',
        error
      });
    }

    isOutOfStock = await checkStock(msg);

    if (isOutOfStock) {
      return res.status(403).json({
        message: 'Item out of stock'
      });
    }

    const [item] = await knex('items').where('id', item_id);
    const data = {
      name: item.name,
      price: item.price,
      stock: item.stock - msg.quantity
    }
    await knex('items').where('id', item_id).update(data);
    return res.status(200).json({
      message: 'Purchased successfully',
      result: data
    });
  });
};

const q = 'check-stock';
const open = amqp.connect(process.env.RABBITMQ_URL);

function publisher(params) {
  open.then((conn) => {
    return conn.createChannel();
  })
    .then((ch) => {
      return ch.assertQueue(q, { durable: false })
        .then((ok) => {
          const msg = JSON.stringify(params)
          return ch.sendToQueue(q, Buffer.from(msg));
        });
    })
    .catch(console.warn);
}

function consumer() {
  open.then((conn) => {
    return conn.createChannel();
  })
    .then((ch) => {
      return ch.assertQueue(q, { durable: false })
        .then((ok) => {
          return ch.consume(q, (msg) => {
            if (msg !== null) {
              let message = msg.content.toString()
              message = JSON.parse(message)
              ch.ack(msg);
              client.hmset(
                `msg-${message.item_id}`, [
                  'item_id', message.item_id,
                  'quantity', message.quantity,
                ], (error, result) => {
                  if (error) {
                    console.error(error)
                  }
                }
              );
            }
          });
        });
    })
    .catch(console.warn);
}

async function checkStock(message) {
  const [item] = await knex('items').where('id', message.item_id);
  let isOutOfStock = false;

  if (item.stock < message.quantity) {
    isOutOfStock = true;
  }

  return isOutOfStock;
}

module.exports = service;