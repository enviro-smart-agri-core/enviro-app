

import { client } from './client'

export const shopApi = {
  getProducts:  (limit = 50, sortBy = 'newest') => client.get(`/api/v1/ecom/products?limit=${limit}&sortBy=${sortBy}`),
  getCart:       ()                 => client.get('/api/v1/ecom/cart'),
  addToCart:    (productId, qty)    => client.post('/api/v1/ecom/cart/items', { productId, quantity: qty }),
  removeFromCart:(productId)        => client.delete(`/api/v1/ecom/cart/items/${productId}`),
  createOrder:  (shippingAddress, paymentMethod) =>
                                       client.post('/api/v1/ecom/orders/checkout', { shippingAddress, paymentMethod }, { 'Idempotency-Key': crypto.randomUUID() }),
  getOrders:    (page = 1, limit = 10) => client.get(`/api/v1/ecom/orders?page=${page}&limit=${limit}`),
  getOrder:     (id)                => client.get(`/api/v1/ecom/orders/${id}`),
}
