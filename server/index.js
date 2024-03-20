const { //up to me to use the function as I see fit. 
    client,
    createTables,
    fetchProduct,
    findUserByToken,
    createProduct,
    viewCart,
    addToCart,
    deleteFromCart,
    fetchUsers,
    fetchProducts,
    destroyProduct,
    authenticate,
    createCategory,
    token, 
    createUser,
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
  //LoggedIn 

  const isLoggedIn = async(req, res, next) => { //Login!! Token required. 
    try {
      req.user = await findUserByToken(req.headers.authorization);
      next();
    }
    catch(ex){
      next(ex);
    }
  };

  //ADMIN FUNCTIONS

//AFTER ISLOGGEDIN
  const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin){
      res.status(401).send("Error"); 
    } else {
      res.send(req.user); 
    } 
   }; 

  app.get("/api/auth/login/products", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //View units to the store as an admin. 
      res.send(await authenticate(req.body));
    } catch (ex) {
      next(ex);
    }
  });
  app.post("/api/auth/products", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //Edits units to the store as an admin. 
      res.send(await authenticate(req.body));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post("/api/auth/product:id", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //Add a unit as an admin. 

      res.send(req.user);
    } catch (ex) {
      next(ex);
    }
  });

  app.delete("/api/auth/:id", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //Deletes selected units as an admin. 
      res.send(req.user);
    } catch (ex) {
      next(ex);
    }
  });


//   //fake middleware. 
//   const users = [
//     {
//       id: 1, 
//       name: "Lucy"
//     },
//     {
//       id: 2, 
//       name: "Yasin"
//     }, 
//     {
//       id: 3,
//       name: "Edwin"
//     }
//   ]

//   const isLoggedIn = (req, res, next) => {
//     req.user = users.find((user) => user.id.toString === req.params.user_id); 
//     next(); 
//   }; 
// //AFTER ISLOGGEDIN
//   const isAdmin = (req, res, next) => {
//     if (!req.user.isAdmin){
//       res.status(401).send("Error"); 
//     } else {
//       res.send(req.user); 
//     } 
//    }; 

//    app.get("/", (req, res) => {
//     res.send("YOLO"); 
//    })

//   app.post("/login", (req,res) => {
//     const user = users.find(user => user.id === req.body.id);
//     req.user = user;
//     res.send(user); 
//   }

//   app.get("/:user_id", isLoggedIn, isAdmin (req, res) => {
//       res.send(req.user); 
//     }); 
//   //
  
  app.get("/api/auth/users", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //View all users as an admin. 
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  //USER FUNCTIONS
  app.post("/api/user/cart/:id", isLoggedIn, async (req, res, next) => {
    try { //Adds an additional qty of one product already in your cart.  
     if (req.params.id !== req.product_id) {

       const error = Error("not authorized");
       error.status = 401;
       throw error;
     }
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
        await deleteProduct({ user_id: req.params.userId, id: req.params.id });
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
        createUser({ email: "Lucy", password: "dargan", is_admin: true }),
        createUser({ email: "Stan", password: "honey" }),
        createCategory({ name: "Accessories"}),
        createProduct({ name: "TL uPhone 7826", cost: 800, description: "Silver uPhone from Tallis-Liore, released Jan 2024", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b", photo_id: "https://images.pexels.com/photos/336948/pexels-photo-336948.jpeg?cs=srgb&dl=pexels-terje-sollie-336948.jpg&fm=jpg" }),
        createProduct({ name: "AD Wise Phone 1988", cost: 700, description: "White Wise Phone from AD Industries, released Feb 2024", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b", photo_id: "https://st2.depositphotos.com/4271317/9876/v/950/depositphotos_98769054-stock-illustration-white-smartphone-mock-up-with.jpg" }),
        createProduct({ name: "Mab AV Headphones (Green)", cost: 12, description: "Green cushioned headphones, attached to a male adaptor, released by Mab in March 2024", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b", photo_id: "https://as2.ftcdn.net/v2/jpg/05/13/95/65/1000_F_513956516_jf7rObIWiBRuVShkygn1QulWCgu00vNX.jpg" }),
        createProduct({ name: "Mab HD Dreammaker 2024 Laptop", cost: 1200, description: "Black laptop with glowing keypad, released by Mab in December 2023", category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b", photo_id: "https://media.istockphoto.com/id/1349374810/photo/a-laptop-half-closed-bright-and-glowing.jpg?s=612x612&w=0&k=20&c=DHKajFhP8y_G_61HqwTW3dJ-nZnx_dSt_V8-NI-VkLs=" }),
      ]);
  const users = await fetchUsers();
    console.log(users);
  const products = await fetchProducts();
    console.log(products);
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  };
  init();

  // products,
    // users,
    // findUserWithToken,