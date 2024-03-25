//data.js 
// Import createUser and createProduct functions
const { createUser, createProduct } = require("./db");

// Function to initialize dummy data
const dummyData = async () => {
  try {
    // Lucy's User
    const user = await Promise.all([
      createUser({
        first_name: "Ozzy",
        last_name: "Valley",
        email: "ozzynotreal@gmail.com",
        password: "eggs",
      }),
    ]);

    // Lucy's Products
    const products = await Promise.all([
      createProduct({
        name: "AD 10 1/2 Inch Wooden Easel for Arists",
        description: "10.5 inch wooden easel for artists, released by AD Industries",
        price: 30.00,
        imageUrl:
          "https://m.media-amazon.com/images/I/71Znw14AVEL._AC_SL1500_.jpg",
      }),
      createProduct({
        name: "AD Acrylic Paints Sets (36 Count)",
        description: "Paints and brush set from AD Industries, released by AD Industries",
        price: 20.00,
        imageUrl: "https://m.media-amazon.com/images/I/71LpvzImoML._AC_SL1500_.jpg",
      }),
      createProduct({
        name: "MABB Hardcover Spiral Sketchbook (8.5'' X 11'')",
        description: "Black hardcover sketchbook, 8/5 X 11 inches from MABB.",
        price: 12.00,
        imageUrl:
          "https://media.istockphoto.com/id/481582684/photo/black-and-white-spiral-notebook-isolated.jpg?s=612x612&w=0&k=20&c=VUVO9gI-09R_HnpE3zxLnRLdUBkRxcFYA7tLTpYAJ_U=",
      }),
      createProduct({
        name: "MABB Colored Pencilset (150 Count)",
        description: "Colored pencilset with black canvas case by MABB.",
        price: 22,
        imageUrl:
          "https://i5.walmartimages.com/seo/Colored-Pencil-Set-amp-Zippered-Case-150-Pkg-Assorted_37883bdc-1f67-4fb2-87d4-f9010d55a738_1.165f81dd1219474d645792048d8ca7e0.jpeg",
      }),
      createProduct({
        name: "AD Oil Soap (1 Gallon), for Oil Painters",
        description: "One gallon jug of Oil Soap for painters, released by AD Industries",
        price: 12.00,
        imageUrl:
          "https://images.thdstatic.com/productImages/3c2aaf6b-8942-474e-9c3f-7a5cfaa1cf5e/svn/murphy-oil-soap-all-purpose-cleaners-61035074-66_600.jpg",
      }),
      createProduct({
        name: "AD Wooden Painting Palette",
        description:
          "Wooden painting palette from AD Industries",
        price: 10.00,
        imageUrl:
          "https://thumbs.dreamstime.com/z/paint-palette-brush-isolated-white-43900876.jpg",
      }),
      createProduct({
        name: "AD Oil Paints Set (24 Count)",
        description: "Oil paints set with 24 units, released by AD Industries",
        price: 25.99,
        imageUrl:
          "https://imgs.michaels.com/MAM/assets/1/5E3C12034D34434F8A9BAAFDDF0F8E1B/img/6FFA8E09B1A74ECB9847E5DAE482D66F/10622006_1.jpg?fit=inside|1280:1280",
      }),
      createProduct({
        name: "AD Watercolor Paints Set with Brush (8 Colors)",
        description: "Water color paints set with 8 colors and 1 brush, from AD Industries",
        price: 9.00,
        imageUrl:
          "https://images.heb.com/is/image/HEBGrocery/003849543-2?jpegSize=150&hei=1400&fit=constrain&qlt=75",
      }),
      createProduct({
        name: "TL 10 Inch X 12 Inch Drawing Tablet with Pen",
        description: "10 IN X 12 IN drawing tablet with adjustable pen, released by Tallis-Liore",
        price: 50.99,
        imageUrl:
          "https://previews.123rf.com/images/rawpixel/rawpixel1711/rawpixel171105844/114714667-person-using-a-digital-drawing-tablet.jpg",
      }),
      createProduct({
        name: "TL On-Screen Drawing Tablet with Charging Cord",
        description: "Drawing Tablet with Screen and matching pen and charging cord, by Tallis-Liore",
        price: 49.99,
        imageUrl:
          "https://www.artnews.com/wp-content/uploads/2022/09/AdobeStock_488384903.jpeg?w=1800",
      }),
      createProduct({
        name: "MABB Charcoal Drawing Set with Kneaded Eraser",
        description: "Charcoal drawing set with eraser, released by MABB",
        price: 39.99,
        imageUrl:
          "https://images.ctfassets.net/f1fikihmjtrp/rj9qIXM4mN6Qlo7qvyOSA/7237d119986c3dfc5aef56572f86f1b5/20445-1009-3-3ww-l.jpg?fit=pad",
      }),
    ]);

    return { user, products };
  } catch (err) {
    console.error("error initializing dummy data", err);
  }
};

// Export the dummyData function
module.exports = { dummyData };
