// import { useState } from 'react'
// import bookLogo from './assets/books.png'
// import Account from "./components/Account.jsx"
// import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
// import Products from "./components/Products.jsx"
// import Navigations from "./components/Navigations.jsx"
// import Register from "./components/Register.jsx"
// import AdminProducts from './components/AdminProducts.jsx'
// import Login from "./components/Login.jsx"
// import './index.css'
// import TokenContext from './TokenContext.js'

// function App() {
//   const [token, setToken] = useState(null);

//   return (
//     <TokenContext.Provider value={[token, setToken]}>
//     <div>
//       <h1><img id='logo-image' src={bookLogo}/>Welcome to Book Buddy</h1>
//       <div id="container">
//         <BrowserRouter>
//         <Navigations/>
//         <div id="main-section">
//           <Routes>
//             <Route path="/" element={<Books/>} token={token}/>
//             <Route path="/products/:productid" element={<SingleBook/>}/>
//             <Route path="/login" element={<Login setToken={setToken}/>} /> 
//             <Route path="/register" element={<Register setToken={setToken}/>}/>
//             <Route path="/account" element={<Account setToken={setToken}/>}/>
//             <Route path="/cart" element={<Cart setToken={setToken}/>}/>
//           </Routes>
//         </div>
//         </BrowserRouter>
//         </div>
//         </div>
//         </TokenContext.Provider>
//   )};
// export default App