import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { HomePage } from '../Pages/homepage';
import { CheckoutPage } from '../Pages/checkoutPage';
import { DeliveryPage } from '../Pages/DeliveryPage';
import { StripePage } from '../Pages/StripePage';
import { useCartQuery } from '../hooks/useCartQuery';
import type { CartItem, Product } from '../types/interfaces';

jest.mock('axios');
jest.mock('../hooks/useCartQuery');
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: jest.fn(),
    useMutation: jest.fn(),
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedUseCartQuery = useCartQuery as jest.Mock;
const mockedUseQueryClient = useQueryClient as jest.Mock;
const mockedUseMutation = useMutation as jest.Mock;

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
    mockedUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    });
  });

  test('HomePage filters products and adds the selected quantity to cart', async () => {
    const user = userEvent.setup();
    const invalidateQueries = jest.fn();
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

    mockedUseCartQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseQueryClient.mockReturnValue({ invalidateQueries });
    mockedAxios.get.mockResolvedValue({ data: products });
    mockedAxios.post.mockResolvedValue({ data: {} });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Search 2 products...')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), 'lap');
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.queryByText('Phone')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), '3');
    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/cart-items', {
        productId: 'p1',
        quantity: 3,
      });
      expect(invalidateQueries).toHaveBeenCalled();
    });
  });

  test('CheckoutPage updates quantity and removes items', async () => {
    const user = userEvent.setup();
    const invalidateQueries = jest.fn();
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
        deliveryOption: {
          priceCents: 499,
        },
      },
    ];

    mockedUseCartQuery.mockReturnValue({
      data: cart,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseQueryClient.mockReturnValue({ invalidateQueries });
    mockedAxios.put.mockResolvedValue({ data: {} });
    mockedAxios.delete.mockResolvedValue({ data: {} });
    mockedUseMutation.mockImplementation(
      ({ mutationFn, onSuccess }: { mutationFn: (value: unknown) => Promise<unknown>; onSuccess?: () => void }) => ({
        mutate: async (value: unknown) => {
          await mutationFn(value);
          onSuccess?.();
        },
        isPending: false,
      })
    );

    renderWithProviders(<CheckoutPage />);

    expect(screen.getByText('Laptop')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Increase quantity of Laptop'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/cart-items/p1', {
        quantity: 3,
      });
      expect(invalidateQueries).toHaveBeenCalled();
    });

    await user.click(screen.getByLabelText('Remove Laptop from cart'));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/cart-items/p1');
    });
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
        deliveryOption: {
          priceCents: 499,
        },
      },
    ];

    mockedUseCartQuery.mockReturnValue({
      data: cart,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });

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
        deliveryOption: {
          priceCents: 499,
        },
      },
    ];

    mockedUseCartQuery.mockReturnValue({
      data: cart,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockedUseQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
    mockedAxios.post.mockResolvedValue({ data: {} });

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
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/orders', {
        deliveryOptionId: '1',
      });
    });
    expect(await screen.findByText('Your delivery is on the way.')).toBeInTheDocument();
  });
});
