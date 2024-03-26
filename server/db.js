// import pg
const pg = require("pg");
// Create new client
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/lucy_new_store_db"
);
// Import uuid
const uuid = require("uuid");
// Import bcrypt
const bcrypt = require("bcrypt");
// Import jsonwebtoken
const jwt = require("jsonwebtoken");
const JWT = process.env.JWT || "shhh";

// Create Tables
const createTables = async () => { // Creates database tables
  const SQL = `
    DROP TABLE IF EXISTS cart;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        email VARCHAR(25) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL, 
        is_admin BOOLEAN DEFAULT false
    );
    CREATE TABLE products (
        id UUID PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        imageUrl VARCHAR(255)
    );
    CREATE TABLE cart (
        id UUID PRIMARY KEY,
        quantity INTEGER NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        CONSTRAINT unique_cart_entry UNIQUE (user_id, product_id)
    );
    `;
  await client.query(SQL);
};

// Create a User
const createUser = async ({ first_name, last_name, email, password, is_admin }) => {  //Creates a new user
  // Create hashed password to be stored in the database to be used for Authentication
  const hashedPassword = await bcrypt.hash(password, 10); // Without this line I can't login after creating an account
  const SQL = `
    INSERT INTO users (id, first_name, last_name, email, password, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    first_name,
    last_name,
    email,
    hashedPassword,
    is_admin
  ]);
  return response.rows[0];
};

// Create a Product
const createProduct = async ({ name, description, price, imageUrl }) => {
  const SQL = `
    INSERT INTO products (id, name, description, price, imageURL) VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    name,
    description,
    price,
    imageUrl,
  ]);
  return response.rows[0];
};

//Creates a new shopping cart
const createCart = async ({ user_id, product_id, quantity }) => {
  const SQL = `
  INSERT INTO cart (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    user_id,
    product_id,
    quantity,
  ]);
  return response.rows[0];
};

// Delete products in the cart
const deleteCart = async ({ user_id, id }) => {
  const SQL = `
  DELETE FROM cart WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [user_id, id]);
};

// Delete products as an admin
const deleteProduct = async ({ id }) => {
  const SQL = `
  DELETE FROM products WHERE id = $1
  `;
  await client.query(SQL, [id]);
};

// Authenticate a user based on email and password. 
const authenticate = async ({ email, password }) => {
  const SQL = `
  SELECT id, password, email FROM users WHERE email = $1
  `;
  const response = await client.query(SQL, [email]);
  if (
    !response.rows.length ||
    (await bcrypt.compare(password, response.rows[0].password)) === false 
  ) {
    const error = Error("Not Authorized");
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({ id: response.rows[0].id }, JWT);
  console.log(token);
  return { token: token };
};

// Function to find a user by their authentication token
const findUserByToken = async (token) => {
  let id;
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  } catch (err) {
    const error = Error("Not Authorized");
    error.status = 401;
    throw error;
  }
  const SQL = `
  SELECT id, first_name, last_name, email, is_admin FROM users WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  console.log(response.rows);
  if (!response.rows.length) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  const user = response.rows[0];
  return user //response.rows[0]; Returning just the user info. 
}

//Fetches users
const fetchUsers = async () => {
  const SQL = `
    SELECT * FROM users
    `;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch all Products for Admin
const fetchProductsAdmin = async () => {
  const SQL = `
    SELECT * FROM products
    `;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch available Products for all
const fetchProducts = async () => {
  const SQL = `
    SELECT * FROM products
    `;
  const response = await client.query(SQL);
  return response.rows;
};

//Fetches a product by its ID
const fetchProductByID = async (id) => {
  const SQL = `
    SELECT * FROM products
    WHERE id=$1
    `;
  const response = await client.query(SQL, [id]);
  return response.rows[0];
};

// Fetches items in cart
const fetchCart = async (user_id) => {
  const SQL = `
    SELECT 
    cart.id AS cart_id,
    products.name AS product,
    cart.quantity AS quantity,
    products.price AS price,
    (cart.quantity * products.price) AS total_price
    FROM cart
    JOIN products ON cart.product_id = products.id WHERE cart.user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

// Export modules
module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  fetchProductsAdmin,
  fetchProductByID,
  authenticate,
  findUserByToken,
  createCart,
  deleteCart,
  fetchCart,
  deleteProduct
};
