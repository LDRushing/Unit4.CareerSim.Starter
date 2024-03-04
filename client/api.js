// export const API_URL = "https://fsa-book-buddy-b6e748d1380d.herokuapp.com/api";

export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
    });
    const result = await response.json();
    console.log(result);
    return result.books;
  } catch (error) {
    console.error(error);
  }
}
export async function getCheckoutProducts(token) {
  const response = await fetch(`${API_URL}/reservations`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return result.reservation;
}

export async function checkoutProduct(productId) {
  console.log(productId);
  try {
    const response = await fetch(`${API_URL}/products/${bookId}`, {
      method: "PATCH", //PATCH modifies a resource, so I'm trying the Patch method for checking out books.
      body: JSON.stringify({ available: false }),
    });
    await response.json();
  } catch (error) {
    console.error(error);
  }
}
export async function getProduct(productId) {
  try {
    const response = await fetch(`${API_URL}/products/${bookId}`);
    const result = await response.json();
    return result.book;
  } catch (error) {
    console.error(error);
  }
}
export async function returnProduct(token, productId) {
  try {
    const response = await fetch(`${API_URL}/reservations/${bookId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    await response.json();
  } catch (error) {
    console.error(error);
  }
}
function handleFilter(query) {
  try {
    const filteredProducts = products.filter((book) => {
      return product.title.toLowerCase().includes(query.toLowerCase());
    });
  } catch (error) {
    console.error("Error while filtering products", error);
    // If they get an error, this message will show up
  }
}
function editCart(token, productId) {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "UPDATE", 
      headers: {
        "Content-Type":"application/json", 
        Authorization: `Bearer ${token}`, 
      },
    });
    await response.json();
  } catch (error){
    console.error("Error when editing this product", error); 
  }
}