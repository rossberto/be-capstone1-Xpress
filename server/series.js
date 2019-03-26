const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/
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

/***** Router Methods *****/
seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (err, rows) => {
    checkError(err);

    res.send({series: rows});
  });
});

seriesRouter.post('/', validateSerie, (req, res, next) => {
  const reqSerie = req.body.series;
  db.run('INSERT INTO Series (name, description) VALUES ($name, $description)',
          {$name: reqSerie.name, $description: reqSerie.description},
          function(err) {
            checkError(err);

            db.get(`SELECT * FROM Series WHERE id=${this.lastID}`,
                    (err, row) => {
                      checkError(err);

                      res.status(201).send({series: row});
                    });
          });
});

seriesRouter.param('id', (req, res, next, id) => {
  db.get('SELECT * FROM Series WHERE id=$id', {$id: id},
          (err, row) => {
            checkError(err);

            if (row) {
              req.dbSeries = row;
              next();
            } else {
              res.status(404).send();
            }
          });
});

seriesRouter.get('/:id', (req, res, next) => {
  res.send({series: req.dbSeries});
});

seriesRouter.put('/:id', validateSerie, (req, res, next) => {
  const reqSerie = req.body.series;

  db.run('UPDATE Series SET name=$name, description=$description',
        {$name: reqSerie.name, $description: reqSerie.description},
        function (err) {
          checkError(err);

          db.get(`SELECT * FROM Series WHERE id=${req.params.id}`,
            (err, row) => {
              checkError(err);

              res.send({series: row});
            });
        });
});

seriesRouter.delete('/:id', (req, res, next) => {
  db.get('SELECT * FROM Issue WHERE series_id=$id', {$id: req.params.id},
        (err, row) => {
          checkError(err);

          if (row) {
            res.status(400).send();
          } else {
            db.run('DELETE FROM Series WHERE id=$id', {$id: req.params.id},
                  (err) => checkError(err));
            res.status(204).send();
          }
  });
});

module.exports = seriesRouter;
