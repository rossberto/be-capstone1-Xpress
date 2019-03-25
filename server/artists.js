const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/***** Auxiliar Functions *****/
function validateArtist(req, res, next) {
  const reqArtist = req.body.artist;

  if (reqArtist.name && reqArtist.dateOfBirth && reqArtist.biography) {
    next();
  } else {
    res.status(400).send();
  }
}

/***** Routes Methods *****/
artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE is_currently_employed=1', (err, rows) => {
    if (err) {
      console.log('>>> Error 500');
      res.status(500).send();
    } else {
      res.send({artists: rows});
    }
  });
});

artistsRouter.post('/', validateArtist, (req, res, next) => {
  const reqArtist = req.body.artist;

  db.run('INSERT INTO Artist (name, date_of_birth, biography) VALUES ($name, $date_of_birth, $biography)',
        {$name: reqArtist.name, $date_of_birth: reqArtist.dateOfBirth, $biography: reqArtist.biography},
        function (err) {
          if (err) {
            res.status(500).send();
          }

          db.get(`SELECT * FROM Artist WHERE id=${this.lastID}`, function (err, row) {
            if (err) {
              res.status(500).send();
            }

            res.status(201).send({artist: row});
          });
  });
});

artistsRouter.param('id', (req, res, next, id) => {
  db.get(`SELECT * FROM Artist WHERE id=${id}`, (err, row) => {
    if (err) {
      res.status(500).send();
    }

    if (row) {
      req.artist = row;
      next();
    } else {
      res.status(404).send();
    }
  });
});

artistsRouter.get('/:id', (req, res, next) => {
  res.send( { artist: req.artist } );
});

artistsRouter.put('/:id', validateArtist, (req, res, next) => {
  const updateArtist = req.body.artist;

  if (!updateArtist.id) {
    updateArtist.id = req.params.id;
  }

  if (!updateArtist.isCurrentlyEmployed) {
    updateArtist.isCurrentlyEmployed = req.artist.is_currently_employed;
  }

  db.run('UPDATE Artist SET id=$id, name=$name, date_of_birth=$dateOfBirth, biography=$biography, is_currently_employed=$isCurrentlyEmployed WHERE id=$id',
          {
            $id: updateArtist.id,
            $name: updateArtist.name,
            $dateOfBirth: updateArtist.dateOfBirth,
            $biography: updateArtist.biography,
            $isCurrentlyEmployed: updateArtist.isCurrentlyEmployed
          },
          function (err) {
            if (err) {
              res.status(500).send();
            }

            db.get('SELECT * FROM Artist WHERE id=$id',
                    {$id: req.params.id}, (err, row) => {
                      if (err) {
                        res.status(500).send();
                      }

                      res.status(200).send({artist: row});
            });
  });
});

artistsRouter.delete('/:id', (req, res, next) => {
  db.run('UPDATE Artist SET is_currently_employed=0 WHERE id=$id', {$id: req.params.id}, err => {
    if (err) {
      res.status(500).send();
    }

    db.get('SELECT * FROM Artist WHERE id=$id', {$id: req.params.id}, (err, row) => {
      if (err) {
        res.status(500).send();
      }

      res.send({artist: row});
    });

    //res.send();
  });
});

module.exports = artistsRouter;
