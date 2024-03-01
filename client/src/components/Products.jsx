/* TODO - add your code to create a functional React component that displays all of the available books in the library's catalog. Fetch the book data from the provided API. Users should be able to click on an individual book to navigate to the SingleBook component and view its details. */
import { useState, useEffect } from "react";
import { getProducts, getProduct } from "../api.js";
import { Routes, Route, useParams, Link } from "react-router-dom";
import SingleProduct from "./SingleProduct.jsx";

export default function Products() {
  const [products, setProducts] = useState([]); //I can always map over an empty array. Null won't work.
//   const [filteredText, setFilteredText] = useState("");
//   const filteredBooks = books.filter(  (book) =>
//   book.title.toLowerCase().includes(filteredText.toLowerCase()) ||
//   book.author.toLowerCase().includes(filteredText.toLowerCase())); 
  useEffect(() => {
    //What does useEffect do? By using this Hook, you tell React that your component needs to do something after render. React will remember the function you passed (we'll refer to it as our “effect”), and call it later after performing the DOM updates.

    async function getAllProducts() {
      const productsResponse = await getProducts();
      setproducts(productsResponse);
    } //Sets the book's value in the state to equal 'books'.
    getAllProducts();
  }, []); //We want our useEffect to end here.

  // Function to handle filtering
  const handleFilter = (text) => {
    setFilteredText(text); // Update filter text state
  };

  return (
    <div>
      <h1>Welcome! Have a Look Around...</h1>
      <input
        type="text"
        placeholder="Filter by title"
        value={filteredText}
        onChange={(e) => handleFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr key={product.title}>
              <td>{product.title}</td>
              <td>{product.details}</td>
              <td>
                <Link to={`/product/${product.id}`}>View This Offer</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredProducts.length === 0 && filteredText.length > 0 && <h2>No products Found. Try searching for something else.</h2>}
    </div>
  );
}