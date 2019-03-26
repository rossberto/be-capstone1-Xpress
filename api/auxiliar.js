const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

function checkError(error) {
  if (error) {
    res.status(500).send();
  }
  return;
}

function validateSerie (req, res, next) {
  const reqSerie = req.body.series;

  if (reqSerie.name && reqSerie.description) {
    next();
  } else {
    res.status(400).send();
  }
}

function getIssues (req, res, next) {
  db.all('SELECT * FROM Issue WHERE series_id=$seriesId', {$seriesId: req.seriesId},
        (err, rows) => {
          checkError(err);

          req.issues = rows;
          next();
  });
}

function validateIssue (req, res, next) {
  const issue = req.body.issue;
  if (issue.name && issue.issueNumber && issue.publicationDate && issue.artistId) {
    next();
  } else {
    res.status(400).send();
  }
}

module.exports = {
  checkError,
  validateSerie,
  validateIssue,
  getIssues,
  validateIssue
}
