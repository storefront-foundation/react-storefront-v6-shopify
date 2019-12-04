import fetch from 'fetch'
import querystring from 'querystring'
import Client from 'shopify-buy'
import Config from 'react-storefront/Config'

function getClient() {
  return Client.buildClient(
    {
      domain: Config.get('shopify_domain'),
      storefrontAccessToken: Config.get('shopify_storefront_access_token')
    },
    fetch
  )
}

export function admin(path, params = {}, method = 'GET', body) {
  const apiPrefix = Config.get('shopify_api_prefix')
  const password = Config.get('shopify_api_password')
  const domain = Config.get('shopify_domain')
  const qs = querystring.stringify({
    ...params
  })
  const headers = {
    'X-Shopify-Access-Token': password
  }
  const url = `https://${domain}/admin/api/${apiPrefix}/${path}.json?${qs}`
  return fetch(url, { method, body, headers }).then(res => res.json())
}

// This is an example, you can easily just use
// other paths for any Admin data you need
// Source: https://help.shopify.com/en/api/reference/products/product
export function fetchVariants(productId) {
  return admin(`products/${productId}/variants`)
}

function transformCollection({ id, title, image, descriptionHtml, products }) {
  return {
    id: id.toString(),
    name: title,
    image: image ? image.src : 'https://placehold.it/100?text=PRODUCT',
    url: `/s/${id}`,
    total: products.length,
    description: descriptionHtml,
    items: products.map(transformProduct)
  }
}

function transformProduct(product) {
  const { handle, productType, title, images, descriptionHtml, variants, options = [] } = product
  const { price } = variants[0]
  const sizeOption = options.find(option => option.name === 'Size')
  const colorOption = options.find(option => option.name === 'Color')
  return {
    id: handle,
    productType,
    name: title,
    url: `/p/${handle}`,
    basePrice: parseFloat(price),
    description: descriptionHtml,
    images: images.map(i => i.src),
    thumbnail: images[0] ? images[0].src : '',
    thumbnails: images.map(i => i.src),
    variantId: variants[0].id.toString(),
    size: sizeOption
      ? {
          options: sizeOption.values.map(size => ({ id: size.value, text: size.value }))
        }
      : null,
    color: colorOption
      ? {
          options: colorOption.values.map(color => ({ id: color.value, text: color.value }))
        }
      : null
  }
}

function transformLineItem({ id, quantity, variant }) {
  const { title, price, image, product } = variant
  return {
    id: product.id.toString(),
    variantId: variant.id.toString(),
    name: title,
    url: `/p/${product.id}`,
    basePrice: parseFloat(price),
    lineItemId: id,
    images: [image.src],
    thumbnail: image.src,
    thumbnails: [image.src],
    quantity
  }
}

export function fetchSubcategories() {
  return getClient()
    .collection.fetchAll()
    .then(collections => collections.map(transformCollection))
    .catch(err => {
      console.log('Error fetching subcategories', JSON.stringify(err))
      return []
    })
}

export function fetchProduct(handle) {
  return getClient()
    .product.fetchByHandle(handle)
    .then(p => transformProduct(p))
}

export function createSessionId() {
  return getClient()
    .checkout.create()
    .then(checkout => checkout.id)
}

export async function getCart(sessionId) {
  const checkout = await getClient().checkout.fetch(sessionId)
  return checkout.lineItems.map(transformLineItem)
}

export function addToCart(product) {
  const sessionId = window.Cookies.get('sessionid')
  return getClient().checkout.addLineItems(sessionId, [
    {
      variantId: product.variantId,
      quantity: product.quantity
    }
  ])
}

export function updateCart(product) {
  const sessionId = window.Cookies.get('sessionid')
  return getClient().checkout.updateLineItems(sessionId, [
    {
      id: product.lineItemId,
      quantity: product.quantity
    }
  ])
}

export function removeFromCart(product) {
  const sessionId = window.Cookies.get('sessionid')
  getClient().checkout.removeLineItems(sessionId, [product.lineItemId])
}

export async function fetchSubcategory(handle, filters) {
  return getClient()
    .collection.fetchByHandle(handle)
    .then(collection => {
      const data = transformCollection(collection)
      if (filters) {
        data.items = data.items.filter(item => filters.includes(item.productType))
      }
      const productTypes = {}
      data.items.forEach(p => {
        productTypes[p.productType] = (productTypes[p.productType] || 0) + 1
      })
      data.facetGroups = [
        {
          name: 'Type',
          facets: Object.keys(productTypes).map(key => ({
            name: key,
            code: key,
            matches: productTypes[key]
          }))
        }
      ]
      return data
    })
}

function transformProductSearchResult({ handle, title, images }) {
  return { text: title, url: `/p/${handle}`, thumbnail: images[0] && images[0].src }
}

function transformCollectionSearchResult({ handle, title, image }) {
  return { text: title, url: `/p/${handle}`, thumbnail: image.src }
}

export function productSearch(query) {
  return getClient()
    .product.fetchQuery({ query })
    .then(products => products.map(transformProductSearchResult))
}

export function categorySearch(query) {
  return getClient()
    .collection.fetchQuery({ query })
    .then(collections => collections.map(transformCollectionSearchResult))
}

export async function fetchProductImages(handle, color) {
  const product = await getClient().product.fetchByHandle(handle)

  const colorVariant = product.variants.find(variant => {
    return variant.selectedOptions.find(opt => opt.name === 'Color' && opt.value === color)
  })
  const images = [colorVariant.image.src]

  return {
    images,
    thumbnails: images,
    thumbnail: images[0]
  }
}

export function fetchMenu() {
  const menu = {
    root: true,
    items: []
  }
  return getClient()
    .collection.fetchAll()
    .then(collections => {
      collections.forEach(({ handle, title }) => {
        menu.items.push({
          text: title,
          prefetch: 'visible',
          url: `/s/${handle}`,
          state: JSON.stringify({
            loadingCategory: { name: title, id: title },
            breadcrumbs: [{ url: '/', text: 'Home' }, { text: title }]
          })
        })
      })
      return { levels: [menu] }
    })
}
