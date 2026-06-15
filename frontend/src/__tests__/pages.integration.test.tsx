import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../Pages/homepage';
import { CheckoutPage } from '../Pages/checkoutPage';
import { DeliveryPage } from '../Pages/DeliveryPage';
import { StripePage } from '../Pages/StripePage';
import {
  useAddToCartMutation,
  useCartQuery,
  usePlaceOrderMutation,
  useProductsQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '../hooks/useShop';
import type { CartItem, Product } from '../types';

jest.mock('../hooks/useShop');

const mockedUseProductsQuery = useProductsQuery as jest.Mock;
const mockedUseCartQuery = useCartQuery as jest.Mock;
const mockedUseAddToCartMutation = useAddToCartMutation as jest.Mock;
const mockedUseUpdateCartItemMutation = useUpdateCartItemMutation as jest.Mock;
const mockedUseRemoveCartItemMutation = useRemoveCartItemMutation as jest.Mock;
const mockedUsePlaceOrderMutation = usePlaceOrderMutation as jest.Mock;

function renderWithProviders(ui: ReactElement, initialEntries: string[] = ['/']) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Pages integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('HomePage filters products and adds the selected quantity to cart', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_payload, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    const products: Product[] = [
      {
        id: 'p1',
        name: 'Laptop',
        priceCents: 12999,
        image: 'images/products/laptop.png',
        rating: { stars: 4.5, count: 12 },
      },
      {
        id: 'p2',
        name: 'Phone',
        priceCents: 7999,
        image: 'images/products/phone.png',
        rating: { stars: 4.2, count: 6 },
      },
    ];

    mockedUseProductsQuery.mockReturnValue({
      data: products,
      isLoading: false,
      isError: false,
    });
    mockedUseCartQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
    });
    mockedUseAddToCartMutation.mockReturnValue({
      mutate,
      isPending: false,
      variables: undefined,
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), 'lap');
    await user.selectOptions(screen.getByRole('combobox'), '3');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { productId: 'p1', quantity: 3 },
        expect.any(Object)
      );
    });
  });

  test('CheckoutPage updates quantity and removes items', async () => {
    const user = userEvent.setup();
    const updateMutate = jest.fn();
    const removeMutate = jest.fn();
    const cart: CartItem[] = [
      {
        product: {
          id: 'p1',
          name: 'Laptop',
          priceCents: 12999,
          image: 'images/products/laptop.png',
          rating: { stars: 4.5, count: 12 },
        },
        quantity: 2,
        deliveryOption: { priceCents: 499 },
      },
    ];

    mockedUseCartQuery.mockReturnValue({
      data: cart,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseUpdateCartItemMutation.mockReturnValue({
      mutate: updateMutate,
      isPending: false,
    });
    mockedUseRemoveCartItemMutation.mockReturnValue({
      mutate: removeMutate,
      isPending: false,
    });

    renderWithProviders(<CheckoutPage />);

    await user.click(screen.getByLabelText('Increase quantity of Laptop'));
    expect(updateMutate).toHaveBeenCalledWith({ productId: 'p1', quantity: 3 });

    await user.click(screen.getByLabelText('Remove Laptop from cart'));
    expect(removeMutate).toHaveBeenCalledWith('p1');
  });

  test('CheckoutPage redirects to Stripe page before payment', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const cart: CartItem[] = [
      {
        product: {
          id: 'p1',
          name: 'Laptop',
          priceCents: 12999,
          image: 'images/products/laptop.png',
          rating: { stars: 4.5, count: 12 },
        },
        quantity: 1,
        deliveryOption: { priceCents: 499 },
      },
    ];

    mockedUseCartQuery.mockReturnValue({
      data: cart,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseUpdateCartItemMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    mockedUseRemoveCartItemMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    mockedUsePlaceOrderMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    renderWithProviders(
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/stripe" element={<StripePage />} />
      </Routes>,
      ['/checkout']
    );

    await user.click(screen.getByRole('button', { name: 'Place Your Order' }));
    jest.advanceTimersByTime(900);

    expect(await screen.findByText('Complete your payment')).toBeInTheDocument();
    jest.useRealTimers();
  });

  test('StripePage submits order and redirects to delivery page', async () => {
    const user = userEvent.setup();
    const mutate = jest.fn((_deliveryOptionId, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    const cart: CartItem[] = [
      {
        product: {
          id: 'p1',
          name: 'Laptop',
          priceCents: 12999,
          image: 'images/products/laptop.png',
          rating: { stars: 4.5, count: 12 },
        },
        quantity: 1,
        deliveryOption: { priceCents: 499 },
      },
    ];

    mockedUseCartQuery.mockReturnValue({
      data: cart,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUsePlaceOrderMutation.mockReturnValue({
      mutate,
      isPending: false,
    });

    renderWithProviders(
      <Routes>
        <Route path="/stripe" element={<StripePage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
      </Routes>,
      ['/stripe']
    );

    await user.type(screen.getByLabelText('Email'), 'buyer@example.com');
    await user.type(screen.getByLabelText('Card information'), '4242424242424242');
    await user.type(screen.getByLabelText('Expiry'), '1230');
    await user.type(screen.getByLabelText('CVC'), '123');
    await user.type(screen.getByLabelText('Cardholder name'), 'Test Buyer');
    await user.type(screen.getByLabelText('Postal code'), '10001');
    await user.click(screen.getByRole('button', { name: 'Pay $148.48' }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith('1', expect.any(Object));
    });
    expect(await screen.findByText('Your delivery is on the way.')).toBeInTheDocument();
  });
});
