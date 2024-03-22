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
    editProduct,
    destroyProduct,
    authenticate,
    createCategory,
    token, 
    createUser,
    logInUser,
    minusQuantity,
    addQuantity,
    deleteFromProducts,
    createCart,
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
//req = request. We're taking input from the user and 
  const logIn = async (req, res, next) => {
    try { 
     req.user = await logInUser ({ username, password }); //passing username and password due to logging in with these keys.  
      next(); 
    } catch(ex){
      next(ex); 
    }
  }

  //ADMIN FUNCTIONS

//AFTER ISLOGGEDIN
  const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin){
      res.status(401).send("Error"); 
    } else {
      res.send(req.user); 
    } 
   }; 

   app.get("/api/auth/login", async (req, res, next) => {  //To login users. app.get << When I open the parenthesis, I'm calling the function and taking arguments. Make sure it goes within the parenthesis. 
    try { 
      const username = req.body.username 
      const password = req.body.password
      console.log(username, password); 
      res.send(await logInUser({username, password }));
      // res.send(await authenticate(req.body)); 
    } catch(ex) {
      next(ex); 
    }})
   
  app.get("/api/login/auth/products", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //View units in the store as an admin. 
      const products = await fetchProductsAsAdmin(); 
      res.send(products);
    } catch (ex) {
      next(ex);
    }
  });

  app.get("/api/login/auth/categories", isLoggedIn, isAdmin, async (req, res, next) => {
    try{ //Create categories with her as an admin. 
      const category = await createCategory();
      res.send(category);
    } catch(ex) {
      next(ex);
    }});

  app.post("/api/auth/products", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //Edits units to the store as an admin. 
      const editedProduct = await editProduct(req.body); 
      res.send(editedProduct);
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post("/api/auth/product:id", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //Add a unit as an admin. 
const products = await createProduct(req.body);
      res.send(products);
    } catch (ex) {
      next(ex);
    }
  });

  app.delete("/api/auth/:id", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //Deletes selected units as an admin. 
      const productId = req.params.id;
      await destroyProduct(productId); 
      res.send({message: "Product deleted successfully"});
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/auth/users", isLoggedIn, isAdmin, async (req, res, next) => {
    try { //View all users as an admin. 
      const username = req.body.username 
      const password = req.body.password
      console.log(username, password); 
      res.send(await fetchUsers({username, password }));
    } catch (ex) {
      next(ex);
    }
  });

  //USER FUNCTIONS
  app.post("/api/user/cart/:id/nav_cart", isLoggedIn, async (req, res, next) => {
    try { //Adds an additional qty of one product already in your cart.  
     if (req.params.id !== req.product_id) {

       const error = new Error("not authorized");
       error.status = 401;
       throw error;
     }
      res.send(await addQuantity(req.params.id));
      product.quantity +=1; // // Code logic to add additional quantity to the product in the user's cart
    } catch (ex) {
      next(ex);
    }
  });

  app.delete("/api/user/cart/:id/nav_cart", isLoggedIn, async (req, res, next) => {
    try { //Edit this to ensure a qty removal from cart. 
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      cartItem.quantity -= 1;  // Example logic to remove quantity of the cart item
      res.send(await minusQuantity(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/user/products/:id/buy", isLoggedIn, async (req, res, next) => {
       //Checkout function for when I have units in my cart. Deleting from the products api.
          try { //Checkout function for when I have units in my cart. Deleting from the products api. 
            if (req.params.id !== req.product.id) {
             const error = Error("not authorizrd"); 
             error.status = 401;
             throw error; 
            }
            res.send(await deleteFromProducts(req.params.id));
          } catch (ex) {
            next(ex);
          }
            })

  app.post("/api/user/:id/cart/:id/retail", isLoggedIn, async (req, res, next) => { //Adds products to my cart. LUCY, START HERE 
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.status(201).send(
          await addToCart({
            user_id: req.params.id,
            product_id: req.body.product_id,
          })
        );
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete( //Remove a product from my cart 
    "/api/users/user/:id/cart/:id/retail",
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

app.post( //creates carts
"apiusers/user/:userId/cart/:id", isLoggedIn, 
async (req, res, next) => {
  try{
    if (req.params.userId !== req.user.id) {
      const error = Error("not authorized"); 
      error.status = 401; 
      throw error; 
    }
    const createdCart = await createCart({ userId: req.params.userId})
    res.status(201).json(createdCart);
  } catch (error) {
    next(error); 
  }
}); 

  //NON-LOGGED IN USERS
  
  app.get("/api/products", async (req, res, next) => { //Creates a table of products to sell. Un-logged in viewers can see this. THIS IS GOOD!! START HERE, LUCY 
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

    const [ozzie, waul, lucy, stan, accessories, phones, laptops] = await Promise.all( //
      [
        createUser({ user_id: '3c9a035e-e45f-4b09-b72f-5dedccd96475', username: "Ozzie", password: "eggs" }),
        createUser({ user_id: '3c9a035e-e45f-4b09-b72f-5dedccd96471', username: "Waul", password: "mice" }),
        createUser({ user_id: '3c9a035e-e45f-4b09-b72f-5dedccd96473', username: "Lucy", password: "dargan", is_admin: true }),
        createUser({  user_id: '3c9a035e-e45f-4b09-b72f-5dedccd96479', username: "Stan", password: "honey" }),
        createCategory({ category_id: 'b09c9aa9-27c5-4be6-bea2-13c92f39830b', name: "Accessories"}),
        createCategory({ category_id: 'b09c9aa9-27c5-4be6-bea2-13c92f39830c', name: "Phones" }), 
        createCategory({ category_id: 'b09c9aa9-27c5-4be6-bea2-13c92f39830d', name: "Laptops"}),
        createProduct({ name: "TL uPhone 7826", cost: 800, description: "Silver uPhone from Tallis-Liore, released Jan 2024", product_id: '3c9a035e-e45f-4b09-b72f-5dedccd96478', category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830c", image_url: "https://images.pexels.com/photos/336948/pexels-photo-336948.jpeg?cs=srgb&dl=pexels-terje-sollie-336948.jpg&fm=jpg" }),
        createProduct({ name: "AD Wise Phone 1988", cost: 700, description: "White Wise Phone from AD Industries, released Feb 2024", product_id: 'c3aa4e0e-4afd-4c51-8156-d1fc551760a6' ,category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830c", image_url: "https://st2.depositphotos.com/4271317/9876/v/950/depositphotos_98769054-stock-illustration-white-smartphone-mock-up-with.jpg" }),
        createProduct({ name: "Mab AV Headphones (Tan)", cost: 12, description: "Tan cushioned headphones, attached to a male adaptor, released by Mab in March 2024", product_id: 'c2d6cac2-6736-4086-bcc7-7d7b7e4ca5ff', category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b", image_url: "https://as2.ftcdn.net/v2/jpg/05/13/95/65/1000_F_513956516_jf7rObIWiBRuVShkygn1QulWCgu00vNX.jpg"}),
        createProduct({ name: "Mab AV Headphones (Green)", cost: 12, description: "Green cushioned headphones, attached to a male adaptor, released by Mab in March 2024", product_id: '5563e0e6-e0aa-498f-abd7-deab19e3593f',  category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b", image_url: "https://as2.ftcdn.net/v2/jpg/05/13/95/65/1000_F_513956516_jf7rObIWiBRuVShkygn1QulWCgu00vNX.jpg" }),
        createProduct({ name: "Mab HD Dreammaker 2024 Laptop", cost: 1200, description: "Black laptop with glowing keypad, released by Mab in December 2023", product_id: '1ad6b9b1-8149-4e0d-ab5e-504cca69a5ca', category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830d", image_url: "https://media.istockphoto.com/id/1349374810/photo/a-laptop-half-closed-bright-and-glowing.jpg?s=612x612&w=0&k=20&c=DHKajFhP8y_G_61HqwTW3dJ-nZnx_dSt_V8-NI-VkLs=" }),
      ]);
      const [firstCart] = await Promise.all([
        createCart({ user_id: ozzie.id }),
      ])
  const users = await fetchUsers();
    console.log(users);
  const products = await fetchProducts();
    console.log(products);
    console.log(firstCart);
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  };
  init();

  // products,
    // users,
    // findUserWithToken,
    //category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830b"
    //category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830c",
    //category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830d"
    //category_id: "b09c9aa9-27c5-4be6-bea2-13c92f39830e",

    
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