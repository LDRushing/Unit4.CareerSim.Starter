// Import Express module
const e = require("express");
const express = require("express");
// // Import cors module
// const express = require("express");
// Create an Express application
const app = express();
// Middleware
app.use(cors()); //Cross Origin Research setting. I can take things from more than one resource. 
app.use(express.json());

// Import path
const path = require("path");

// Import functions from "./db" file
const {
  client,
  createTables, // Function to create database tables
  createUser, // Function to create a new user
  createCart, // Function to create a new shopping cart
  fetchUsers, // Function to fetch users
  fetchProducts, // Function to fetch products
  fetchProductByID, // Function to fetch a product by its ID
  fetchCart, // Function to fetch the shopping cart
  deleteCart, // Function to delete the shopping cart
  authenticate, // Function to authenticate a user
  findUserByToken, // Function to find a user by their authentication token
} = require("./db");
// Import dummyData object from the "./data" module
const { dummyData } = require("./data");

// static routes here (you only need these for deployment)
app.use(express.static(path.join(__dirname, "../client/dist")));

// app routes here
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);

// Middleware function to check if a user is logged in
const isLoggedIn = async (req, res, next) => {
  try {
    const { user, cart } = await findUserByToken(req.headers.authorization);
    req.user = user;
    req.cart = cart;
    next();
  } catch (err) {
    next(err);
  }
};

// POST Register a new user
app.post("/api/auth/register", async (req, res, next) => {
  try {
    res.send(await createUser(req.body));
  } catch (err) {
    next(err);
  }
});

// POST Login user
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (err) {
    next(err);
  }
});

// GET to retrieve user info
app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
  try {
    res.send({ user: req.user, cart: req.cart });
  } catch (err) {
    next(err);
  }
});

// GET Users. If I make changes in VSCode, it'll restart the server. 
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (err) {
    // error handling
    res.status(500).json({ error: "Failed to load users" });
    next(err);
  }
});

// GET Products
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (err) {
    // error handling
    res.status(500).json({ error: "Failed to load products" });
    next(err);
  }
});

// GET Single Product
app.get("/api/products/:id", async (req, res, next) => {
  try {
    const singleProduct = await fetchProductByID(req.params.id);
    res.send(singleProduct);
  } catch (err) {
    // error handling
    res.status(500).json({ error: "Failed to load the product" });
    next(err);
  }
});

// GET items in cart
app.get("/api/users/:id/cart", isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) {
      const error = Error("not authorized");
      error.status = 401;
      throw error;
    }
    const cartItems = await fetchCart(req.params.id);
    res.send(cartItems);
  } catch (err) {
    next(err);
  }
});

// POST items in cart. POST is in this route and isLoggedIn means that the user needs to be logged in. 
app.post("/api/users/:id/cart", isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id) {
      const error = Error("not authorized");
      error.status = 401;
      throw error;
    }
    res.status(201).send(
      await createCart({
        user_id: req.params.id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
      })
    );
  } catch (err) {
    next(err);
  }
});

// DELETE products in the cart
app.delete(
  "/api/users/:user_id/cart/:id",
  isLoggedIn,
  async (req, res, next) => {
    try {
      if (req.params.user_id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      await deleteCart({ user_id: req.params.user_id, id: req.params.id });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

// Create init function
const init = async () => {
  const PORT = process.env.PORT || 3000;
  await client.connect();
  console.log("connected to database");

  await createTables();
  console.log("tables created");

  // Initialize dummy data
  const { user, products } = await dummyData();
  // Express server to listen
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};

// init function invocation
init();