
//server/db.js
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/lucy_stores_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

const createTables = async () => {
     //SQL here to create these two tables. You have to drop the child table FIRST. Hence why the notes table is first. 
    console.log("connected to database");
    const SQL = `
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL, 
      is_admin BOOLEAN DEFAULT FALSE
       );
    CREATE TABLE categories(
      id UUID PRIMARY KEY,
      name VARCHAR(100)
      );
      CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    cost INTEGER DEFAULT 3 NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_id INTEGER REFERENCE products(id) NOT NULL
    );`;
    await client.query(SQL); //Including foreign key which is a category ID.
    console.log("tables created"); //Seeding data. I can use Postman to update 'learn express' to 'learn express and routing' for example. Just select PUT & JSON in Postman. 
    SQL = `
    INSERT INTO users(username, password, is_admin) VALUES ('Ozzie', 'eggs', false);
    INSERT INTO users(username, password, is_admin) VALUES ('Waul', 'mice', false);
    INSERT INTO users(username, password, is_admin) VALUES ('Lucy', 'dargan', true);
    INSERT INTO users(username, password, is_admin) VALUES ('Stan', 'honey', false);
    INSERT INTO categories(name) VALUES('Accessories');
    INSERT INTO categories(name) VALUES('Phones');
    INSERT INTO categories(name) VALUES('Computers');
    INSERT INTO products(name, cost, category_id) VALUES('TL uPhone 7826', $1200.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(name, cost, category_id) VALUES('AD Wise Phone 1988', $700.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(name, cost, category_id) VALUES('Mab AV Headphones (Blue)', $12.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(name, cost, category_id) VALUES('Mab AV Headphones (Blue)', $50.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(name, cost, category_id) VALUES('Mab HD Dreammaker 2024 Laptop', $1100.99, (SELECT id FROM categories WHERE name='Computer'));
  `;
    await client.query(SQL); //Applying the SQL. The categories in our API are coming from the data that we seeded. Didn't need to put the ID bc the ID is being generated for us, due to inputting 'id SERIAL PRIMARY KEY'. 
    console.log("data seeded");
  };


//ALL USERS:
const fetchProducts = async()=> { //View all units. Anyone can view. 
  const SQL = `
  SELECT *
  FROM products
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchProduct = async()=> { //Fetch single product. Anyone can view. 
  const SQL = `
  SELECT *
  FROM products
    `;
    const response = await client.query(SQL);
    return response.rows;
};

//LOGGED-IN USERS

const createUser = async({ username, password })=> { //Create account
  const SQL = `
  INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *
`;
const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.has(password, 5),]);
return response.rows[0];
};
const authenticate = async({ username, password })=> { //authentication tokens. 
const SQL = `
  SELECT id, password
  FROM users
  WHERE username = $1
`;
const response = await client.query(SQL, [ username ]);
if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password))=== false){
  const error = Error('not authorized');
  error.status = 401;
  throw error;
}
const token = await jwt.sign({ id: response.rows[0].id}, JWT);
return { token };
};

const viewCart = async() => { //View cart.  
  const SQL = `
  SELECT *
  from cart
  `;
  const response = await client.query(SQL); 
  return response.rows;
}

const addToCart = async({ user_id, product_id })=> { //Logged-In users only. 
    const SQL = `
    INSERT INTO cart(id, user_id, product_id) VALUES($1, $2, $3) RETURNING *
  `;//Line 52 is selector names for our IDs in our API. UUIDs were being sent in the payload and we want to make sure our place names and usernames are being sent. We're asking 'Give me the foreign key for $1' instead of the uuid and to post that instead. 
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id ]);
  return response.rows[0];
};

const deleteFromCart = async({ user_id, product_id })=> { //Logged-In users only. 
  const SQL = `
    DELETE from cart (user_id, product_id) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0]; 
}

//ADMIN ONLY Functions

const fetchUsers = async()=> { //ADMIN ONLY
    const SQL = `
    SELECT *
    FROM users
      `;
      const response = await client.query(SQL);
      return response.rows;
};

const createProduct = async(name)=> { //ADMIN ONLY 
  const SQL = `
  INSERT INTO products(id, name) VALUES($1, $2) RETURNING *
`;
const response = await client.query(SQL, [uuid.v4(), name]);
return response.rows[0];
};

const destroyProduct = async({product_id, id})=> { //ADMIN ONLY 
  const SQL = ` 
DELETE FROM products
where id = $1
  `;
  await client.query(SQL, [id]);
};

const findUserByToken = async(token) => { 
  let id;
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  }
  catch(ex){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const SQL = `
    SELECT id, username
    FROM users
    WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if(!response.rows.length){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  return response.rows[0];

}

module.exports = {
  findUserByToken, 
  createTables,
  authenticate,
  fetchProduct,
  createUser,
  createProduct,
  viewCart,
  addToCart,
  deleteFromCart,
  fetchUsers,
  fetchProducts,
  destroyProduct
};
//Promise.all allows me to run multiple promises at once. According to Younghee, they tend to make the app crash. Promise.all runs all asynchronous functions one after the other. Promise.all seeds the data. We're creating Moe, Rome, Paris, Lucy, etc. Placed it into a different function and calling it. 
//Set up those two foreign keys. 