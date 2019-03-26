const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const aux = require('./auxiliar.js');
const issuesRouter = require('./issues.js');

/***** Series Router Methods *****/
seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (err, rows) => {
    aux.checkError(err);

    res.send({series: rows});
  });
});

seriesRouter.post('/', aux.validateSerie, (req, res, next) => {
  const reqSerie = req.body.series;
  db.run('INSERT INTO Series (name, description) VALUES ($name, $description)',
          {$name: reqSerie.name, $description: reqSerie.description},
          function(err) {
            aux.checkError(err);

            db.get(`SELECT * FROM Series WHERE id=${this.lastID}`,
                    (err, row) => {
                      aux.checkError(err);

                      res.status(201).send({series: row});
                    });
          });
});

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get('SELECT * FROM Series WHERE id=$id', {$id: seriesId},
          (err, row) => {
            aux.checkError(err);

            if (row) {
              req.seriesId = seriesId;
              req.dbSeries = row;
              next();
            } else {
              res.status(404).send();
            }
          });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.send({series: req.dbSeries});
});

seriesRouter.put('/:seriesId', aux.validateSerie, (req, res, next) => {
  const reqSerie = req.body.series;

  db.run('UPDATE Series SET name=$name, description=$description',
        {$name: reqSerie.name, $description: reqSerie.description},
        function (err) {
          aux.checkError(err);

          db.get(`SELECT * FROM Series WHERE id=${req.params.seriesId}`,
            (err, row) => {
              aux.checkError(err);

              res.send({series: row});
            });
        });
});

seriesRouter.delete('/:seriesId', aux.getIssues, (req, res, next) => {
  if (req.issues.length > 0) {
    res.status(400).send();
  } else {
    db.run('DELETE FROM Series WHERE id=$id', {$id: req.seriesId},
          (err) => aux.checkError(err));
    res.status(204).send();
  }
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

module.exports = seriesRouter;
