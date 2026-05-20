// src/pricingService.js

export async function fetchPricing() {
  const response = await fetch("/.netlify/functions/get-pricing");

  if (!response.ok) {
    throw new Error("Failed to load HubSpot pricing");
  }

  return response.json();
}
