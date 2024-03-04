//users
//Email  PK string varchar not null
//Password  string varchar  not null
//First Name string varchar
//Last Name string varchar
//Address string varchar   not null
//Payment Info string varchar
//Phone Number string varchar
//Logged In  (boolean)  false
//Admin?  (boolean)  false

// SELECT * FROM users;
// SELECT * FROM users WHERE admin = true;
// SELECT * FROM users WHERE email = 'bob@mail.com';
//Reference for Block 33 - Foreign Keys
const pg = require("pg"); //Bringing in our different libraries we'll be using like PG and Express, and our database connection
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/lucy_stores_db"
); //Connecting to the right database.
const app = express();

//app routes

app.get('/api/categories', async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from categories
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

app.get('/api/notes', async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from notes ORDER BY created_at DESC;
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

app.post('/api/notes', async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO notes(txt, category_id)
      VALUES($1, $2)
      RETURNING *
    `
    const response = await client.query(SQL, [req.body.txt, req.body.category_id])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

app.put('/api/notes/:id', async (req, res, next) => { 
  try { //Put inserts new code/info into the big code itself. 
    const SQL = `
      UPDATE notes
      SET txt=$1, ranking=$2, category_id=$3, updated_at= now()
      WHERE id=$4 RETURNING *
    `
    const response = await client.query(SQL, [ //including this new data, which is coming from the api path itself on line 174. We want to make sure we're only making changes to the note:id we're targeting. 
      req.body.txt,
      req.body.ranking,
      req.body.category_id,
      req.params.id
    ])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const SQL = `
      DELETE from notes
      WHERE id = $1
    `
    const response = await client.query(SQL, [req.params.id])
    res.sendStatus(204)
  } catch (ex) {
    next(ex)
  }
})

function init() {
  const init = async () => {
    await client.connect(); //SQL here to create these two tables. You have to drop the child table FIRST. Hence why the notes table is first. 
    console.log("connected to database");
    let SQL = `DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    CREATE TABLE categories(
      id SERIAL PRIMARY KEY, 
      name VARCHAR(255) NOT NULL); 
       );
      CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    cost INTEGER DEFAULT 3 NOT NULL,
    name VARCHAR(255) NOT NULL
    category_id INTEGER REFERENCE categories(id) NOT NULL
    is_admin BOOLEAN DEFAULT FALSE
    );`;
    await client.query(SQL); //Including foreign key which is a category ID.
    console.log("tables created"); //Seeding data. I can use Postman to update 'learn express' to 'learn express and routing' for example. Just select PUT & JSON in Postman. 
    SQL = `
    INSERT INTO categories(name) VALUES('Accessories');
    INSERT INTO categories(name) VALUES('Phones');
    INSERT INTO categories(name) VALUES('Computers');
    INSERT INTO products(name, cost, category_id) VALUES('TL uPhone 7826', $1200.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(name, cost, category_id) VALUES('AD Wise Phone 1988', $700.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(name, cost, category_id) VALUES('Mab AV Headphones (Blue)', $12.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(name, cost, category_id) VALUES('TL Plug-In Phone Charger', $50.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(name, cost, category_id) VALUES('Mab HD Dreammaker 2024 Laptop', $1100.99, (SELECT id FROM categories WHERE name='Computer'));
  `;
    await client.query(SQL); //Applying the SQL. The categories in our API are coming from the data that we seeded. Didn't need to put the ID bc the ID is being generated for us, due to inputting 'id SERIAL PRIMARY KEY'. 
    console.log("data seeded");
  };
}
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));
init();
