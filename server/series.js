const express = require('express');
const seriesRouter = express.Router();

seriesRouter.get('/', (req, res, next) => {
  console.log('>>> Get all series');
});

module.exports = seriesRouter;
