import './checkout.css';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router';
import { FiMinus, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import axios, { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { cartQueryKey, useCartQuery } from '../hooks/useCartQuery';
import {
  getItemsTotal,
  getShippingTotal,
  getTotalQuantity,
} from '../assets/cartSummary';
import { Footer } from './Footer';
import { CheckoutHeader } from './CheckoutHeader';
import type { CartItem } from '../types/interfaces';

interface UpdateQuantityPayload {
  productId: string;
  quantity: number;
}

export function CheckoutPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
  const getImageSrc = (imagePath: string): string =>
    imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  const {
    data: cart = [],
    isLoading,
    isError,
    error,
  } = useCartQuery();

  const totalQuantity = getTotalQuantity(cart);
  const itemsTotal = getItemsTotal(cart);
  const shippingTotal = getShippingTotal(cart);

  const subtotal = itemsTotal + shippingTotal;
  const tax = Math.round(subtotal * 0.1);
  const orderTotal = subtotal + tax;

  const removeCartItemMutation = useMutation({
    mutationFn: (productId: string) => axios.delete(`/api/cart-items/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
    onError: (error: AxiosError) => {
      console.error('Error removing from cart:', error);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: UpdateQuantityPayload) =>
      axios.put(`/api/cart-items/${productId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
    onError: (error: AxiosError) => {
      console.error('Error updating quantity:', error);
    },
  });

  const handleRemoveFromCart = (productId: string): void => {
    removeCartItemMutation.mutate(productId);
  };

  const updateQuantity = (productId: string, delta: number): void => {
    const cartItem = cart.find((item: CartItem) => item.product?.id === productId);
    if (!cartItem) return;

    const newQuantity = (cartItem.quantity || 0) + delta;

    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const isMutating =
    removeCartItemMutation.isPending || updateQuantityMutation.isPending;
  const estimatedDeliveryDate = dayjs().add(5, 'day').format('dddd, MMMM D');

  const handlePlaceOrder = (): void => {
    setOrderPlaced(true);
    setTimeout(() => navigate('/stripe'), 900);
  };

  if (isLoading) {
    return <div className="checkout-page">Loading cart...</div>;
  }

  if (isError) {
    return (
      <div className="checkout-page">
        Error loading cart: {error?.message || 'Something went wrong'}
      </div>
    );
  }

  return (
    <>
      <title>Checkout</title>
      <CheckoutHeader totalQuantity={totalQuantity} />

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <div className="order-summary">
            {cart.length === 0 ? (
              <div className="cart-item-container empty-cart-message">
                Your cart is empty. <Link to="/">Continue shopping</Link>
              </div>
            ) : (
              cart.map((item: CartItem) => (
                <div key={item.product.id} className="cart-item-container">
                  <div className="delivery-date">
                    Delivery date: {estimatedDeliveryDate}
                  </div>

                  <div className="cart-item-details-grid">
                    <img
                      className="product-image"
                      src={getImageSrc(item.product.image)}
                      alt={item.product.name}
                    />

                    <div className="cart-item-details">
                      <div className="product-name">{item.product.name}</div>

                      <div className="product-price">
                        {formatPrice(item.product.priceCents)}
                      </div>

                      <div className="product-quantity">
                        <div
                          className="quantity-controls"
                          aria-label="Item quantity controls"
                        >
                          <button
                            type="button"
                            className="quantity-button"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            onClick={() => updateQuantity(item.product.id, -1)}
                            disabled={isMutating}
                          >
                            <FiMinus />
                          </button>

                          <div className="quantity-item">{item.quantity}</div>

                          <button
                            type="button"
                            className="quantity-button"
                            aria-label={`Increase quantity of ${item.product.name}`}
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={isMutating}
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="delete-quantity-link"
                          aria-label={`Remove ${item.product.name} from cart`}
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          disabled={isMutating}
                        >
                          <span className="delete-icon-wrap" aria-hidden="true">
                            <FiTrash2 className="delete-icon" />
                          </span>
                          <span className="delete-label">Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="line-item-total">
                      {formatPrice(item.product.priceCents * item.quantity)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="payment-summary">
            <div className="payment-summary-title">Payment Summary</div>

            <div className="payment-summary-row">
              <div>Items ({totalQuantity}):</div>
              <div className="payment-summary-money">
                {formatPrice(itemsTotal)}
              </div>
            </div>

            <div className="payment-summary-row">
              <div>Shipping &amp; handling:</div>
              <div className="payment-summary-money">
                {formatPrice(shippingTotal)}
              </div>
            </div>

            <div className="payment-summary-row subtotal-row">
              <div>Total before tax:</div>
              <div className="payment-summary-money">
                {formatPrice(subtotal)}
              </div>
            </div>

            <div className="payment-summary-row">
              <div>Estimated tax (10%):</div>
              <div className="payment-summary-money">{formatPrice(tax)}</div>
            </div>

            <div className="payment-summary-row total-row">
              <div>Order total:</div>
              <div className="payment-summary-money">
                {formatPrice(orderTotal)}
              </div>
            </div>

            <button
              className="place-order-button button-primary"
              disabled={cart.length === 0 || isMutating || orderPlaced}
              onClick={handlePlaceOrder}
            >
              {orderPlaced && (
                <span className="button-success">
                  <FiCheck style={{ marginRight: '8px' }} />
                  Order Placed!
                </span>
              )}
              {!orderPlaced && 'Place Your Order'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
