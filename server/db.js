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
const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS cart;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        email VARCHAR(25) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
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
const createUser = async ({ first_name, last_name, email, password }) => {
  // Create hashed password to be stored in the database to be used for Authentication
  const hashedPassword = await bcrypt.hash(password, 10); // Without this line I can't login after creating an account
  const SQL = `
    INSERT INTO users (id, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
  const response = await client.query(SQL, [
    uuid.v4(),
    first_name,
    last_name,
    email,
    hashedPassword,
  ]);
  return response.rows[0];
};

// Create a Product
const createProduct = async ({ name, description, price, imageUrl }) => {
  const SQL = `
    INSERT INTO products (id, name, description, price, imageUrl) VALUES ($1, $2, $3, $4, $5) RETURNING *
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

// Create Cart
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

// Authenticate a user based on email and password
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

// Find user by token
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
  SELECT id, first_name, last_name, email FROM users WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  const user = response.rows[0];
  // Fetch cart products for user
  const cartSQL = `
  SELECT products.name AS product, cart.quantity AS quantity, products.price, (cart.quantity * products.price) AS total_price FROM cart
  JOIN products ON cart.product_id = products.id
  WHERE cart.user_id = $1
  `;
  const cartResponse = await client.query(cartSQL, [id]);
  const cartProducts = cartResponse.rows;
  return { user: user, cart: cartProducts };
};

// Fetch Users
const fetchUsers = async () => {
  const SQL = `
    SELECT * FROM users
    `;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch Products
const fetchProducts = async () => {
  const SQL = `
    SELECT * FROM products
    `;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch Single Product by ID
const fetchProductByID = async (id) => {
  const SQL = `
    SELECT * FROM products
    WHERE id=$1
    `;
  const response = await client.query(SQL, [id]);
  return response.rows[0];
};

// Fetch items in cart
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
  fetchProductByID,
  authenticate,
  findUserByToken,
  createCart,
  deleteCart,
  fetchCart,
};
