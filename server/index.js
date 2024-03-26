// Import Express module
const express = require("express");
// Create an Express application
const app = express();
// Middleware
app.use(express()); 
app.use(express.json());

// Import path
const path = require("path");

// Import functions from "./db" file
const {
  client,
  createTables, 
  createUser,
  createCart, 
  fetchUsers, 
  fetchProducts, 
  fetchProductByID, 
  fetchCart, 
  deleteCart, 
  authenticate, 
  findUserByToken, 
  deleteProduct,
  createProduct,
  fetchProductsAdmin
} = require("./db");
// Import dummyData object from the "./data" module
const { dummyData } = require("./data");

// static routes here (you only need these for deployment)
app.use(express.static(path.join(__dirname, "../client/dist")));

// app routes here
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);

// Middleware function to check if a user is logged in. Finding user info for the token that exists. 
const isLoggedIn = async (req, res, next) => {
  try {
    const user = await findUserByToken(req.headers.authorization);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if(!req.user){
      const user = await findUserByToken(req.headers.authorization); 
      req.user = user; //checking for is_admin.
    }
    console.log(req.user); 
    if(req.user.is_admin){
      next(); 
    }else{
      const error = Error("not authorized");
      error.status = 401;
      throw error; //Calling the next function. 
    }
  } catch (err) {
    next(err);
  }
};

app.use((err, req, res, next) => { //error handling
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err });
});

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
app.get("/api/users", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (err) {
    // error handling
    res.status(500).json({ error: "Failed to load users" });
    next(err);
  }
});

// GET all Products for Admin
app.get("/api/products/all", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const products = await fetchProductsAdmin();
    res.send(products);
  } catch (err) {
    // error handling
    console.error("Failed to fetch all products for admin:", err);
    res.status(500).json({ error: "Failed to load products" });
    next(err);
  }
});

//GET available products
app.get("/api/products/", async (req, res, next) => {
  try {
    const products = await fetchProducts();
    res.send(products);
  } catch (err) {
    // error handling
    console.error("Failed to fetch available products:", err);
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
//Add units as an ADMIN 
app.post("/api/products/:id", isLoggedIn, isAdmin, async (req, res, next) => {
try {
  // if (req.body.user_id !== req.user.id) {
  //   const error = Error("not authorized");
  //   error.status = 401;
  //   throw error;
  // }
  res.status(201).send(
    await createProduct({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl
    })
  );
} catch (err) {
  next(err);
}});

// DELETE products as an Admin
app.delete(
  "/api/products/:id",
  isLoggedIn, isAdmin,
  async (req, res, next) => {
    try {
      await deleteProduct({ user_id: req.params.user_id, id: req.params.id });
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
  const userProducts = await dummyData();
  // Express server to listen
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};

// init function invocation
init();