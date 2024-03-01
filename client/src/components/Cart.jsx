import { useState, useEffect } from "react";
import { getCheckoutBooks, returnBook } from "../api.js";
import useToken from "../useToken.js";
export default Cart;


function Cart(){
  const [checkedOutBooks, setCheckedOutBooks] = useState([]);
  const [token] = useToken();
  useEffect(() => {
    getCheckoutBooks(token).then(setCheckedOutBooks)
    // Fetch and display currently checked out books when the component mounts
    //getCheckoutBooks(token);
  }, []);

  const handleRemove = async (product) => {
    await removeProducts(token, bookid)
    getCheckoutProducts(token).then(setCheckedOutProducts)
  };
  // Handle error, e.g., show error message to the user
  //'bId' is 'bookId' abbreviated.
  return (
    <div>
      <h1>My Account</h1>
      <h2>Total Items</h2>
      <ul>
        {selectedProducts.map((book) => (
          <li key={book.id}>
            {book.title}
              <button type="button" onClick={() => handleCheckout(product.id)}>
                Return
              </button>
          </li>
        ))}
      </ul>
    </div>
  );
}