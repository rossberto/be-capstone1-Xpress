const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

module.exports = app;

const PORT = process.env.PORT || 4000;

// Middleware for handling CORS requests from index.html
app.use(morgan('dev'));
// Middware for parsing request bodies here:
app.use(bodyParser.json());

const apiRouter = require('./server/api');
app.use('/api', apiRouter);

// Conditional for testing purposes:
if (!module.parent) {
  // Start the server listening at PORT below:
  app.listen(PORT, console.log(`Server listening at port ${PORT}.`));
}
