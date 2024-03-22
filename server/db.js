
//server/db.js
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/lucy_stores_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.jwt || 'shhh';


const createTables = async () => {
     //SQL here to create these two tables. You have to drop the child table FIRST. Hence why the notes table is first. Products go above categories because it references it 
    console.log("connected to database");
    const SQL = `
    DROP TABLE IF EXISTS cart_products;
    DROP TABLE IF EXISTS carts;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL, 
      is_admin BOOLEAN DEFAULT FALSE
       );
    CREATE TABLE categories(
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
      );
    CREATE TABLE products(
        id UUID PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        cost INTEGER DEFAULT 3 NOT NULL,
        quantity INTEGER DEFAULT 0, 
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        image_url TEXT,
        category_id UUID REFERENCES categories(id) NOT NULL
        );
    CREATE TABLE carts(
          id UUID PRIMARY KEY,
          user_id UUID REFERENCES users(id) NOT NULL
          );
    CREATE TABLE cart_products(
        cart_id UUID REFERENCES carts(id),
        product_id UUID REFERENCES products(id) NOT NULL,
        quantity INTEGER DEFAULT 0,
        PRIMARY KEY (cart_id, product_id)
      );`;
    await client.query(SQL); //Including foreign key which is a category ID. Update the products in my cart somehow. 
    console.log("tables created"); //Seeding data. I can use Postman to update 'learn express' to 'learn express and routing' for example. Just select PUT & JSON in Postman. 
    const INSERT_SQL = `
    INSERT INTO categories(id, name) VALUES('b09c9aa9-27c5-4be6-bea2-13c92f39830b','Accessories');
    INSERT INTO categories(id, name) VALUES('b09c9aa9-27c5-4be6-bea2-13c92f39830c', 'Phones');
    INSERT INTO categories(id, name) VALUES('b09c9aa9-27c5-4be6-bea2-13c92f39830d', 'Laptops'); 
  `;
  //Cart_products is for when you don't lose the units in your cart. When the user checks out, I must be able to delete products from my products table and empty out my carts_products table. 
    await client.query(INSERT_SQL); //Applying the SQL. The categories in our API are coming from the data that we seeded. Didn't need to put the ID bc the ID is being generated for us, due to inputting 'id SERIAL PRIMARY KEY'. 
    console.log("data seeded");
  };

/*

    INSERT INTO products(id, name, cost, category_id) VALUES('3c9a035e-e45f-4b09-b72f-5dedccd96478', 'TL uPhone 7826', $1200.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(id, name, cost, category_id) VALUES('c3aa4e0e-4afd-4c51-8156-d1fc551760a6', 'AD Wise Phone 1988', $700.99, (SELECT id FROM categories WHERE name='Phones'));
    INSERT INTO products(id, name, cost, category_id) VALUES('c2d6cac2-6736-4086-bcc7-7d7b7e4ca5ff', 'Mab AV Headphones (Green)', $12.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(id, name, cost, category_id) VALUES('5563e0e6-e0aa-498f-abd7-deab19e3593f', 'Mab AV Headphones (Tan)', $12.99, (SELECT id FROM categories WHERE name='Accessories'));
    INSERT INTO products(id, name, cost, category_id) VALUES('1ad6b9b1-8149-4e0d-ab5e-504cca69a5ca', 'Mab HD Dreammaker 2024 Laptop', $1100.99, (SELECT id FROM categories WHERE name='Computers'));
    INSERT INTO cart_products (SELECT id FROM products WHERE name='Products');
 */
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

const createUser = async({ username, password, is_admin })=> { //Create account
  const SQL = `
  INSERT INTO users(id, username, password, is_admin) VALUES($1, $2, $3, $4) RETURNING *
`;
const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5), is_admin]);
return response.rows[0];
};

const logInUser = async({ username, password })=> { //takes in a username and password
  const SQL = `
  SELECT *
  FROM users WHERE username=$1
  `;
  const response = await client.query(SQL, [username]); //queries for a user based on username. Checks for a response. IF we get one back, there's a user. 
  console.log(response, "within logInUser")
  if (response.rows.length) {
    const isSamePassword = await bcrypt.compare(password, response.rows[0].password) //compare their password with our hash password. 
    if (isSamePassword === false){
      throw new Error (`Incorrect Password`) //if they don't match. 
    } 
    return response.rows[0] //returns the user. 
  }
  return response.rows;
} 

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
return { token: token };
};
//LOGIN FUNCTION

const createCart = async({user_id}) => { //Create cart on click. Include token/authentication. No one else should see my own cart. 
  const SQL = `
  INSERT INTO carts(id, user_id) VALUES ($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id]);
  return response.rows[0];
};
const viewCart = async() => { //View cart. Fetch the instance of one user's cart. Fetch the cart ID.   
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

const addQuantity = async({ cart_id, product_id })=> { //Logged in users only. Add quantites of the same unit to the cart BEFORE checkout. 
  const SQL = `
  INSERT INTO carts_products(id, cart_id, product_id, quantity) VALUES($1, $2, $3, $4) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), cart_id, product_id]);
  return response.rows[0]; 
}

const minusQuantity = async({ user_id, product_id })=> { //Logged in users only/ Subtract quantities of the same unit to the care BEFORE checkout. 
  const SQL = `
  DELETE from carts_products (id, cart_id, product_id, quantity) VALUES($1, $2, $3, $4) RETURNING *
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
//Photo ID. When I create an <img><img>. I would store the source of the image url to the image. 
//Route to Login and Logout; 
//Edit Products << ADMIN only; DONE 
//I need to verify if they're an admin through either middleware or repeatedly write logic that checks if they're an admin. DONE
//I have data seeded to work off of. 
//Within the product table, I have cost, id, etc. Whenever I move a unit into the cart_products, have enough of the units to move. I'm subtracting from the products table. It's like moving shoes from location A to location B. 

//ADMIN ONLY Functions
const fetchProductsAsAdmin = async(id)=> {
  const SQL = `
  SELECT *
  FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchUsers = async(name)=> { //ADMIN ONLY
    const SQL = `
    SELECT *
    FROM users
      `;
      const response = await client.query(SQL);
      return response.rows;
};

const createProduct = async({name, cost, description, category_id, image_url})=> { //ADMIN ONLY 
  const SQL = `
  INSERT INTO products(id, name, cost, description, category_id, image_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
`;
const response = await client.query(SQL, [uuid.v4(), name, cost, description, category_id, image_url]);
return response.rows[0];
};

const editProduct = async({name, cost, description, category_id, image_url})=> {
  const SQL = `
  POST INTO products(id, name, cost, description, category_id, image_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING
  `;
  const response = await client.query(SQL, [uuidv4(), name, cost, description, category_id, image_url]);
  return response.rows[0];
}

const createCategory= async({name})=> {
  const SQL = `INSERT into categories(id, name) VALUES($1, $2) RETURNING *`;
  const response = await client.query(SQL, [uuid.v4(), name]); 
  return response.rows[0];
}
const destroyProduct = async({name})=> { //ADMIN ONLY; Delete products from the DB. 
  const SQL = ` 
DELETE FROM products
where id = $1
  `;
  await client.query(SQL, [id], name);
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
  createCategory,
  fetchProduct,
  logInUser,
  editProduct,
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
  fetchProductsAsAdmin,
  client
};
//Promise.all allows me to run multiple promises at once. According to Younghee, they tend to make the app crash. Promise.all runs all asynchronous functions one after the other. Promise.all seeds the data. We're creating Moe, Rome, Paris, Lucy, etc. Placed it into a different function and calling it. 
//Set up those two foreign keys. 
