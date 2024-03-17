
//server/db.js
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/lucy_stores_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.jwt || 'shhh';


const createTables = async () => {
     //SQL here to create these two tables. You have to drop the child table FIRST. Hence why the notes table is first. 
    console.log("connected to database");
    const SQL = `
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS cart_products;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS carts;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL, 
      is_admin BOOLEAN DEFAULT FALSE
       );
    CREATE TABLE products(
        id UUID PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        cost INTEGER DEFAULT 3 NOT NULL,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL
        );
    CREATE TABLE carts(
          id UUID PRIMARY KEY,
          name VARCHAR(100)
          );
    CREATE TABLE cart_products(
        cart_id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        CONSTRAINT unique_user_id_product_id UNIQUE (user_id, product_id)
      );
    
      )`;
    await client.query(SQL); //Including foreign key which is a category ID. 
    console.log("tables created"); //Seeding data. I can use Postman to update 'learn express' to 'learn express and routing' for example. Just select PUT & JSON in Postman. 
    SQL = `
    INSERT INTO users(id, email, password, is_admin) VALUES ('287c4460-18cb-476b-809d-a1da50cc3459', 'Ozzie', 'eggs', false);
    INSERT INTO users(id, email, password, is_admin) VALUES ('3f7c557a-ca3a-4914-9c84-03e2fbc04fbb', 'Waul', 'mice', false);
    INSERT INTO users(id, email, password, is_admin) VALUES ('871daffd-77c2-40e7-8ab6-c89db82fe9a3', 'Lucy', 'dargan', true);
    INSERT INTO users(id, email, password, is_admin) VALUES ('3b347f01-9fea-43fe-95af-549c140a836d', 'Stan', 'honey', false);
    
    Start here Lucy, post OSP on Friday 3/15/2024
    INSERT INTO categories(id, name) VALUES('b09c9aa9-27c5-4be6-bea2-13c92f39830b','Accessories');
    INSERT INTO categories(id, name) VALUES('086107f1-e52e-47c7-8a45-067930f9e59a','Phones');
    INSERT INTO categories(id, name) VALUES('33586335-ba28-4742-8e92-f4108e9ee9dc', 'Computers');
    INSERT INTO products(id, name, cost, category_id) VALUES('3c9a035e-e45f-4b09-b72f-5dedccd96478', 'TL uPhone 7826', $1200.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(id, name, cost, category_id) VALUES('c3aa4e0e-4afd-4c51-8156-d1fc551760a6', 'AD Wise Phone 1988', $700.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(id, name, cost, category_id) VALUES('c2d6cac2-6736-4086-bcc7-7d7b7e4ca5ff', 'Mab AV Headphones (Green)', $12.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(id, name, cost, category_id) VALUES('5563e0e6-e0aa-498f-abd7-deab19e3593f', 'Mab AV Headphones (Tan)', $12.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(id, name, cost, category_id) VALUES('1ad6b9b1-8149-4e0d-ab5e-504cca69a5ca', 'Mab HD Dreammaker 2024 Laptop', $1100.99, (SELECT id FROM categories WHERE name='Computers'));
    INSERT INTO cart_products (SELECT id FROM products WHERE name='Products');
  `;
  //Cart_products is for when you don't lose the units in your cart. When the user checks out, I must be able to delete products from my products table and empty out my carts_products table. 
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

const fetchProduct = async(id)=> { //Fetch single product. Anyone can view. 
  const SQL = `
  SELECT *
  FROM products WHERE id=$1
    `;
    const response = await client.query(SQL, [id]);
    return response.rows;
};

//LOGGED-IN USERS

const createUser = async({ username, password })=> { //Create account
  const SQL = `
  INSERT INTO users(id, email, password) VALUES($1, $2, $3) RETURNING *
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
const response = await client.query(SQL, [ username, password ]);
if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password))=== false){
  const error = Error('not authorized');
  error.status = 401;
  throw error;
}
const token = await jwt.sign({ id: response.rows[0].id}, jwt);
return { token };
};

const createCart = async() => { //Create cart on click. 
  const SQL = `
  INSERT INTO carts(id, name, cost, category_id) VALUES ($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL);
  return response.rows[0];
};
const viewCart = async() => { //View cart.  
  const SQL = `
  SELECT *
  from carts
  `;
  const response = await client.query(SQL); 
  return response.rows;
}

const addToCart = async({ user_id, product_id })=> { //Logged-In users only. 
    const SQL = `
    INSERT INTO carts(id, name, cost, category_id) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id ]);
  return response.rows[0];
};

const deleteFromCart = async({ user_id, product_id })=> { //Logged-In users only. Purchased products leaving the cart post-checkout.
  const SQL = `
    DELETE from carts (id, name, cost, category_id) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0]; 
}

const addQuantity = async({ user_id, product_id })=> { //Logged in users only. Add quantites of the same unit to the cart BEFORE checkout. 
  const SQL = `
  INSERT from products (id, name, cost, category_id) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0]; 
}

const minusQuantity = async({ user_id, product_id })=> { //Logged in users only/ Subtract quantities of the same unit to the care BEFORE checkout. 
  const SQL = `
  INSERT from products (id, name, cost, category_id) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0]; 
}

const deleteFromProducts = async({ product_id }) => { //Products leaving the products database due to checking out. 
  const SQL = `
  DELETE from products (id, name, cost, category_id) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
  return response.rows[0];
}

//ADMIN ONLY Functions

const fetchUsers = async(name)=> { //ADMIN ONLY
    const SQL = `
    SELECT *
    FROM users
      `;
      const response = await client.query(SQL);
      return response.rows;
};

const createProduct = async(name)=> { //ADMIN ONLY 
  const SQL = `
  INSERT INTO products(id, name, cost, category_id) VALUES($1, $2, $3, $4) RETURNING *
`;
const response = await client.query(SQL, [uuid.v4(), name]);
return response.rows[0];
};

const destroyProduct = async({name})=> { //ADMIN ONLY 
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
  createCart,
  viewCart,
  addToCart,
  deleteFromCart,
  deleteFromProducts,
  fetchUsers,
  fetchProducts,
  destroyProduct,
  createUser,
  addQuantity,
  minusQuantity,
  secret,
  client,
};
//Promise.all allows me to run multiple promises at once. According to Younghee, they tend to make the app crash. Promise.all runs all asynchronous functions one after the other. Promise.all seeds the data. We're creating Moe, Rome, Paris, Lucy, etc. Placed it into a different function and calling it. 
//Set up those two foreign keys. 
