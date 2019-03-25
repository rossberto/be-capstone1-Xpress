const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize(() => {
  db.run('DROP IF EXISTS TABLE Artist', (err) => {});
  db.run('CREATE TABLE Artist (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, name TEXT NOT NULL, date_of_birth TEXT NOT NULL, biography TEXT NOT NULL, is_currently_employed INTEGER DEFAULT 1 )', (err) => {});

  db.run('DROP IF EXISTS TABLE Series', (err) => {});
  db.run('CREATE TABLE Series (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL)', (err) => {});

  db.run('DROP IF EXISTS TABLE Issue', (err) => {});
  db.run('CREATE TABLE Issue (id INTEGER PRIMARY KEY NOT NULL AUTOINCREMENT, name TEXT NOT NULL, issue_number TEXT NOT NULL, publication_date TEXT NOT NULL, FOREIGN KEY(artist_id) REFERENCES Artist(id), FOREIGN KEY(series_id) REFERENCES Series(id))', (err) => {});
});
