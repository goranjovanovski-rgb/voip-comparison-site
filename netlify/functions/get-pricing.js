// netlify/functions/get-pricing.js

export async function handler() {
  try {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/products?limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    const products = data.results.map((product) => ({
      id: product.id,
      name: product.properties.name,
      price: Number(product.properties.price || 0),
      description: product.properties.description || ""
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(products)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}
