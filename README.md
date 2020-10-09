# React Storefront v6 Shopify Connector

## Setup

- Add `react-storefront-shopify` to your project
- When developing locally you will need to add `shopify_domain`, `shopify_storefront_access_token`, `shopify_api_prefix`, `shopify_access_token`, and `shopify_client_id` to your `blob.dev.js` file in order for this module to query the Shopify API's

### Usage

Here are a few built in methods for fetching data from Shopify:

- `admin(path, params)` The base Admin API helper method.

  The rest of the methods will transform the Shopify responses to reflect the React Storefront models. This is done to make integration simpler.

- `fetchSubcategories()` method for fetching subcategories
- `fetchProduct(handle)` method for fetching a specific product
- `fetchSubcategory(handle, filters)` Fetch specific subcategory with associated products optionally filtered
- `createSessionId()`
- `getCart(sessionId)`
- `addToCart(product)` Add a product {variantId, quantity} to the cart
- `updateCart(product)` Update product {lineItemId, quantity} in cart
- `removeFromCart(product)` Remove product {lineItemId} from cart
- `productSearch(query)` Fetch product search results
- `categorySearch(query)` Fetch category search results
- `fetchProductImages(handle, color)` Fetch product images by color
- `fetchMenu()` Fetching root level categories in menu item form

## Changelog

### 1.1.0

- Added proper admin api endpoint
