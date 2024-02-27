//password
//email
//name
//address
//SELECT * FROM users
const pg = require("pg");
const express = require("express"); //Using this to talk to the database.
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_notes_db"
); //Acme notes db defined.
const app = express(); //this gives us the express application.
//app routes
app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/notes', async (req, res, next) => {});
app.get('/api/notes', async (req, res, next) => {
    try {
    const SQL = `SELECT * from notes ORDER BY created_at DESC;`
    const response = await client.query(SQL)
    res.send(result.rows)

    }catch(error){
     next(error) //this is coming from our morgan library. 
    }
});
app.put('/api/notes/:id', async (req, res, next) => {});
app.delete('/api/notes/:id', async (req, res, next) => {});

//Create a function
const init = async () => {
  await client.connect(); //we talk to it this way.
  console.log("connected to database");
  let SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
);
    `;
  await client.query(SQL);
  console.log("tables created");
  SQL = `
  INSERT INTO notes(txt, ranking) VALUES('learn express', 5);
  INSERT INTO notes(txt, ranking) VALUES('write SQL queries', 4);
  INSERT INTO notes(txt, ranking) VALUES('create routes', 2);
);
    `;
  await client.query(SQL); //Applying the SQL.
  console.log("data seeded");
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`listening on port ${port}`)) 
};
init ()