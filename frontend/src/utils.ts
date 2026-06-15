import type { CartItem } from './types';

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getImageSrc(imagePath: string): string {
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

export function getRatingImageSrc(stars: number): string {
  const rounded = Math.round(stars * 2) / 2;
  return `/images/ratings/rating-${rounded * 10}.png`;
}

export function getTotalQuantity(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getOrderSummary(cart: CartItem[]) {
  const itemsTotal = cart.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0
  );
  const shippingTotal = cart.reduce(
    (total, item) => total + (item.deliveryOption?.priceCents ?? 0),
    0
  );
  const subtotal = itemsTotal + shippingTotal;
  const tax = Math.round(subtotal * 0.1);

  return {
    totalQuantity: getTotalQuantity(cart),
    itemsTotal,
    shippingTotal,
    subtotal,
    tax,
    orderTotal: subtotal + tax,
  };
}
