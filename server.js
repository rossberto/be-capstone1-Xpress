const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

const cors = require('cors');
const errorhandler = require('errorhandler');

module.exports = app;

const PORT = process.env.PORT || 4000;

// Middleware for handling CORS requests from index.html
app.use(morgan('dev'));
// Middleware for parsing request bodies here:
app.use(bodyParser.json());
// Middleware for CORS
app.use(cors());
// Middleware for handling errors
app.use(errorhandler());

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

// Conditional for testing purposes:
if (!module.parent) {
  // Start the server listening at PORT below:
  app.listen(PORT, console.log(`Server listening at port ${PORT}.`));
}
