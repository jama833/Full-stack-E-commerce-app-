import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { CartItem, Product } from '../types';

const productsKey = ['products'] as const;
const cartKey = ['cart'] as const;

async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/api/products');
  return data ?? [];
}

async function fetchCart(): Promise<CartItem[]> {
  const { data } = await api.get<CartItem[]>('/api/cart-items?expand=product');
  return (data ?? []).filter((item) => item?.product);
}

function useInvalidateCart() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: cartKey });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: productsKey,
    queryFn: fetchProducts,
  });
}

export function useCartQuery() {
  return useQuery({
    queryKey: cartKey,
    queryFn: fetchCart,
    retry: 1,
  });
}

export function useAddToCartMutation() {
  const invalidateCart = useInvalidateCart();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.post('/api/cart-items', { productId, quantity }),
    onSuccess: invalidateCart,
  });
}

export function useUpdateCartItemMutation() {
  const invalidateCart = useInvalidateCart();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.put(`/api/cart-items/${productId}`, { quantity }),
    onSuccess: invalidateCart,
  });
}

export function useRemoveCartItemMutation() {
  const invalidateCart = useInvalidateCart();

  return useMutation({
    mutationFn: (productId: string) => api.delete(`/api/cart-items/${productId}`),
    onSuccess: invalidateCart,
  });
}

export function usePlaceOrderMutation() {
  const invalidateCart = useInvalidateCart();

  return useMutation({
    mutationFn: (deliveryOptionId: string) =>
      api.post('/api/orders', { deliveryOptionId }),
    onSuccess: invalidateCart,
  });
}
