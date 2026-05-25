import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { HomePage } from '../Pages/homepage';
import { CheckoutPage } from '../Pages/checkoutPage';
import { StripePage } from '../Pages/StripePage';
import { useCartQuery } from '../hooks/useCartQuery';
import type { CartItem, Product } from '../types/interfaces';

jest.mock('axios');
jest.mock('../hooks/useCartQuery');
jest.mock('../Pages/Header', () => ({
  Header: ({ onSearch, searchPlaceholder }: { onSearch?: (query: string) => void; searchPlaceholder?: string }) => (
    <input
      aria-label="search products"
      placeholder={searchPlaceholder}
      onChange={(event) => onSearch?.(event.target.value)}
    />
  ),
}));
jest.mock('../Pages/Footer', () => ({
  Footer: () => <div>Footer</div>,
}));
jest.mock('../Pages/CheckoutHeader', () => ({
  CheckoutHeader: ({ totalQuantity }: { totalQuantity: number }) => <div>Checkout Header {totalQuantity}</div>,
}));
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

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Pages unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    });
    mockedUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  test('HomePage renders fetched products', async () => {
    const products: Product[] = [
      {
        id: 'p1',
        name: 'Laptop',
        priceCents: 12999,
        image: 'images/products/laptop.png',
        rating: { stars: 4.5, count: 12 },
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: products });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search 1 products...')).toBeInTheDocument();
  });

  test('CheckoutPage renders summary for cart items', () => {
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

    renderWithProviders(<CheckoutPage />);

    expect(screen.getByText('Review your order')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    expect(screen.getByText('Checkout Header 2')).toBeInTheDocument();
  });

  test('StripePage renders payment form and order total', () => {
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

    renderWithProviders(<StripePage />);

    expect(screen.getByText('Complete your payment')).toBeInTheDocument();
    expect(screen.getByText('Order summary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pay $148.48' })).toBeInTheDocument();
  });
});
