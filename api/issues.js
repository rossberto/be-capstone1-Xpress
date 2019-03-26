const express = require('express');
const issuesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const aux = require('./auxiliar.js');

/********** Issues Methods **********/
issuesRouter.get('/', aux.getIssues, (req, res, next) => {
  res.send({issues: req.issues});
});

issuesRouter.post('/', aux.validateIssue, (req, res, next) => {
  const newIssue = req.body.issue;

  db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)',
          {$name: newIssue.name,
           $issueNumber: newIssue.issueNumber,
           $publicationDate: newIssue.publicationDate,
           $artistId: newIssue.artistId,
           $seriesId: req.seriesId},
         function (err) {
           aux.checkError(err);

           db.get(`SELECT * FROM Issue WHERE id=${this.lastID}`,
             (err, row) => {
               aux.checkError(err);

               res.status(201).send({issue: row});
           });
         });
});

issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get('SELECT id FROM Issue WHERE id=$issueId', {$issueId: issueId},
          (err, row) => {
            aux.checkError(err);

            if (row) {
              next();
            } else {
              res.status(404).send();
            }
          });
});

issuesRouter.put('/:issueId', aux.validateIssue, (req, res, next) => {
  const reqIssue = req.body.issue;

  db.run('UPDATE Issue SET name=$name, issue_number=$issueNumber, publication_date=$publicationDate, artist_id=$artistId WHERE id=$issueId',
          {$name: reqIssue.name,
           $issueNumber: reqIssue.issueNumber,
           $publicationDate: reqIssue.publicationDate,
           $artistId: reqIssue.artistId,
           $issueId: req.params.issueId},
         function (err) {
           aux.checkError(err);

           db.get(`SELECT * FROM Issue WHERE id=${req.params.issueId}`, (err, row) => {
             res.send({issue: row})
           });
  });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run('DELETE FROM Issue WHERE id=$issueId', {$issueId: req.params.issueId},
          (err) => {
            aux.checkError(err);
            res.status(204).send();
          });
});

module.exports = issuesRouter;
