import { CartItem } from '../types/interfaces';

export function getTotalQuantity(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

export function getItemsTotal(cart: CartItem[]): number {
  return cart.reduce(
    (total, item) =>
      total + ((item.product?.priceCents || 0) * (item.quantity || 0)),
    0
  );
}

export function getShippingTotal(cart: CartItem[]): number {
  return cart.reduce(
    (total, item) => total + (item.deliveryOption?.priceCents || 0),
    0
  );
}
