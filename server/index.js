const {
    client,
    createTables,
    fetchProduct,
    findUserByToken,
    createUser,
    createProduct,
    viewCart,
    addToCart,
    deleteFromCart,
    fetchUsers,
    fetchProducts,
    destroyProduct,
    authenticate,
    createCategory,
    createAccount,
    products,
    users,
    findUserWithToken,
  } = require("./db");
  const express = require("express");
  const app = express();
  app.use(express.json());
  
  //for deployment only
  const path = require("path");
  app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "../client/dist/index.html"))
  );
  app.use(
    "/assets",
    express.static(path.join(__dirname, "../client/dist/assets"))
  );
  const isLoggedIn = async (req, res, next) => {
    try {
      req.user = await findUserByToken(req.headers.authorization);
      next();
    } catch (ex) {
      next(ex);
    }
  };
  //ADMIN FUNCTIONS
  app.get("/api/auth/login/products", async (req, res, next) => {
    try { //View units to the store as an admin. 
      res.send(await authenticate(req.body));
    } catch (ex) {
      next(ex);
    }
  });
  app.post("/api/auth/products", async (req, res, next) => {
    try { //Edits units to the store as an admin. 
      res.send(await authenticate(req.body));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post("/api/auth/product:id", isLoggedIn, async (req, res, next) => {
    try { //Add a unit as an admin. 
      res.send(req.user);
    } catch (ex) {
      next(ex);
    }
  });

  app.delete("/api/auth/:id", isLoggedIn, async (req, res, next) => {
    try { //Deletes selected units as an admin. 
      res.send(req.user);
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/auth/users", async (req, res, next) => {
    try { //View all users as an admin. 
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  //USER FUNCTIONS
  app.post("/api/user/cart/:id", isLoggedIn, async (req, res, next) => {
    try { //Adds an additional qty of one product already in your cart.  
     // if (req.params.id !== req.product_id) {

    //    const error = Error("not authorized");
    //    error.status = 401;
    //    throw error;
    //  }
      res.send(await fetchProducts(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  app.delete("/api/user/cart/:id", isLoggedIn, async (req, res, next) => {
    try { //Edit this to ensure a qty removal from cart. 
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.send(await fetchProducts(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/user/products/:id", isLoggedIn, async (req, res, next) => {
    try { //Checkout function for when I have units in my cart. Deleting from the products api. 
      if (req.params.id !== req.product.id) {
       const error = Error("not authorizrd"); 
       error.status = 401;
       throw error; 
      }
      res.send(await fetchProducts(req.params.id));
    } catch (ex) {
      next(ex);
    }
      })

  app.post("/api/cart/:id/", isLoggedIn, async (req, res, next) => { //Adds products to my cart.
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res
        .status(201)
        .send(
          await createUser({
            user_id: req.params.id,
            product_id: req.body.product_id,
          })
        );
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete( //Remove a product from my cart 
    "/api/users/user/:id/cart/:id",
    isLoggedIn,
    async (req, res, next) => {
      try {
        if (req.params.userId !== req.user.id) {
          const error = Error("not authorized");
          error.status = 401;
          throw error;
        }
        await deleteUserSkill({ user_id: req.params.userId, id: req.params.id });
        res.sendStatus(204);
      } catch (ex) {
        next(ex);
      }
    }
  );
  
  app.get("/api/products", async (req, res, next) => { //Creates a table of products to sell. Un-logged in viewers can see this.  
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  app.get("/api/products/:id", async (req, res, next) => { //Selects one product from the products table. 
    try {
      res.send(await fetchProduct(req.params.id));
    } catch (ex) {
      next(ex); 
    }
  })

  app.use((err, req, res, next) => { //error-handling 
    console.log(err);
    res.status(err.status || 500).send({ error: err.message || err });
  });
  
  const init = async () => {
    await client.connect();
    console.log("connected to database");
    await createTables();
    console.log("tables created");

    const [ozzie, waul, lucy, stan, tlUphone7826, adWisePhone1988, mabAvHeadphonesBlue, mabHdDreammaker2024Laptop] = await Promise.all( //
      [
        createUser({ email: "Ozzie", password: "eggs" }),
        createUser({ email: "Waul", password: "mice" }),
        createUser({ email: "Lucy", password: "dargan" }),
        createUser({ email: "Stan", password: "honey" }),
        createCategory({ name: "Accessories"}),
        createProduct({ name: "TL uPhone 7826", cost: 12, description: "a", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b" }),
        createProduct({ name: "AD Wise Phone 1988", cost: 12, description: "a", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b"  }),
        createProduct({ name: "Mab AV Headphones (Blue)", cost: 12, description: "a", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b"  }),
        createProduct({ name: "Mab HD Dreammaker 2024 Laptop", cost: 12, description: "a", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b" }),
      ]);
  const users = await fetchUsers();
    console.log(users);
  const products = await fetchProducts();
    console.log(products);
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  };
  
  init();