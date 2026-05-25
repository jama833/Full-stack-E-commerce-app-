import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { CartItem } from '../types/interfaces';

export const cartQueryKey = ['cart'];

export const getCart = async (): Promise<CartItem[]> => {
  const response = await axios.get('/api/cart-items?expand=product');
  return response.data;
};

export function useCartQuery() {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
  });
}
