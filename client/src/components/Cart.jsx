// import { useState, useEffect } from "react";
// import { getCheckoutBooks, returnBook } from "../api.js";
// import useToken from "../useToken.js";
// export default Cart;


// function Cart(){
//   const [checkedOutBooks, setCheckedOutBooks] = useState([]);
//   const [addItems, setAddItems] = useState([]); 
//   const [removeProducts, setRemoveProducts] = useState([]); 
//   const [token] = useToken();
//   useEffect(() => {
//     getCheckoutBooks(token).then(setCheckedOutBooks)
//     // Fetch and display currently checked out books when the component mounts
//     //getCheckoutBooks(token);
//   }, []);

//   const addProducts = async (product) => {
//     await editProducts(token, productid)
//     getEditProducts(token).then(setAddProducts)
//   }; 

//   const handleRemove = async (product) => {
//     await removeProducts(token, productid)
//     getCheckoutProducts(token).then(setCheckedOutProducts)
//   };
//   // Handle error, e.g., show error message to the user
//   //'bId' is 'bookId' abbreviated.
//   return (
//     <div>
//       <h1>My Account</h1>
//       <h2>Total in Cart</h2>
//       <ul class="checkout">
//         {selectedProducts.map((book) => (
//           <li key={product.id}>
//             {product.name} - {item.price} 
//               <button type="button" onClick={() => handleCheckout(product.id)}>
//                 Return
//               </button>
//           </li>
//         ))}
//       </ul>
//       <ul class="edit">
//         {selectedProducts.map((product) => (
//             <li key={product.id}>
//         <button type="button" onCLick={() => handleEdit(product.id)}></button>
//         </li>
//         ))}
//         </ul>
//     </div>
//   );
// }