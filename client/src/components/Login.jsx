/* TODO - add your code to create a functional React component that renders a login form */
import { useState } from "react";
import useToken from "../useToken";
import { API_URL } from "../api.js";


function Login() {
  const [token, setToken] = useToken();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false); //According to freeCodeCame, useState(false) returns an array. The first item contains the state value, which currently is false (because the state's been initialized with false ). on state variable holds the state value.
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleEmailChange = (event) => {
    const { value } = event.target;
    setEmail(value);
    setIsValidEmail(validateEmail(value));
  };

  const handlePasswordChange = (event) => {
    const { value } = event.target;
    setPassword(value);
    setIsValidPassword(validatePassword(value));
  };

  const validateEmail = (email) => {
    // Simple email validation using a regular expression
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //According to Simplilearn, JavaScript RegEx is a sequence of characters that forms a search pattern.
    return regex.test(email);
  };

  const validatePassword = (password) => {
    // Password validation (for example, requiring a minimum length)
    return password.length >= 6;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isValidEmail && isValidPassword) {
        // console.log("Email and password are valid:", email, password);
        const response = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password }),
        });
        const userResponse = await response.json();
        setToken(userResponse.token); //SetToken() to set token after login, logout or registration, which is what we want!
        setIsLoggedIn(true);
        return userResponse;
      } else {
        alert("Please enter a valid email and password.");
      }
    } catch (error) {
      console.error(error);
    }
  };
  //This is a control form where I have more control over my data.
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <div>
        <h2>Welcome, {email}!</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
export default Login;