const express = require('express');

const router = express.Router();

const appController = require('../controllers/appController');

router.get(
  '/',
  appController.getIndexPage,
);

router.post(
  '/item',
  appController.validateInput,
  appController.addItem,
);

router.get(
  '/item/:id',
  appController.getItem,
);

router.put(
  '/item/:id',
  appController.validateInput,
  appController.checkItemExists,
  appController.updateItem,
);

router.delete(
  '/item/:id',
  appController.checkItemExists,
  appController.deleteItem,
);

router.get(
  '/items',
  appController.getItems,
);

router.put(
  '/item/:id/buy',
  appController.purchaseItem,
);

module.exports = router;