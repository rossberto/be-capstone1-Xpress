const express = require('express');
const artistsRouter = express.Router();

artistsRouter.get('/', (req, res, next) => {
  console.log('>>> Get all artists');
});

module.exports = artistsRouter;
