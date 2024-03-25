// /* TODO - add your code to create a functional React component that renders a registration form */
// //Update this to reflect registration.
// import { API_URL } from "../api.js";
// import React, { useState } from "react";
// // import Login from "./Login.jsx";
// // import Navigations from "./Navigations.jsx";
// // import Account from "./Account.jsx";

// function Register({ setToken }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isValidEmail, setIsValidEmail] = useState(false); //According to freeCodeCame, useState(false) returns an array. The first item contains the state value, which currently is false (because the state's been initialized with false ). on state variable holds the state value.
//   const [isValidPassword, setIsValidPassword] = useState(false);

//   const handleEmailChange = (event) => {
//     const { value } = event.target;
//     setEmail(value);
//     setIsValidEmail(validateEmail(value));
//     // console.log(email);
//     //LUCY, get rid of your console.logs before turning this in!!
//   };

//   const handlePasswordChange = (event) => {
//     const { value } = event.target;
//     setPassword(value);
//     setIsValidPassword(validatePassword(value));
//     // console.log(password);
//     //LUCY, get rid of your console.logs before turning this in!!
//   };

//   const validateEmail = (email) => {
//     // Simple email validation using a regular expression
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //According to Simplilearn, JavaScript RegEx is a sequence of characters that forms a search pattern.
//     return regex.test(email);
//   };

//   const validatePassword = (password) => {
//     // Password validation (for example, requiring a minimum length)
//     return password.length >= 6;
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       if (isValidEmail && isValidPassword) {
//         // console.log("Email and password are valid:", email, password);
//         const response = await fetch(`${API_URL}/users/register`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email: email, password: password }),
//         });
//         const userResponse = await response.json();
//         setToken(userResponse.token); // call setToken here, userResponse.token
//         // console.log({userResponse},'THIS IS COMING IN FROM LINE 57');
//         return userResponse;
//       } else {
//         alert("Please enter a valid email and password.");
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   //email , password
//   //}
//   //}

//   // Submit the registration form.

//   return (
//     <div>
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit}>
//         <label>
//           Email:
//           <input
//             type="email"
//             value={email}
//             onChange={handleEmailChange}
//             required
//           />
//         </label>
//         <label>
//           Password:
//           <input
//             type="password"
//             value={password}
//             onChange={handlePasswordChange}
//             required
//           />
//         </label>
//         {/* <button onClick={() => onClick( isValidEmail, isValidPassword )}>Register</button> */}
//         <button onClick={handleSubmit}>Register</button>
//       </form>
//     </div>
//   );
// }
// export default Register;