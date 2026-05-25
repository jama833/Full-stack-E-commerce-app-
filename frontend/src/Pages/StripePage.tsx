import './stripe.css';
import axios from 'axios';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheck, FiCreditCard, FiLock, FiShield } from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { cartQueryKey, useCartQuery } from '../hooks/useCartQuery';
import { getItemsTotal, getShippingTotal, getTotalQuantity } from '../assets/cartSummary';
import { CheckoutHeader } from './CheckoutHeader';
import { Footer } from './Footer';

interface PaymentForm {
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
  postalCode: string;
}

const defaultPaymentForm: PaymentForm = {
  email: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
  name: '',
  postalCode: '',
};

const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

export function StripePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PaymentForm>(defaultPaymentForm);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

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

  const orderPreview = useMemo(
    () => cart.slice(0, 3).map((item) => item.product.name).join(', '),
    [cart]
  );

  const handleInputChange = (field: keyof PaymentForm) => (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setPaymentError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (cart.length === 0) {
      setPaymentError('Your cart is empty.');
      return;
    }

    setIsPaying(true);
    setPaymentError('');

    try {
      await axios.post('/api/orders', { deliveryOptionId: '1' });
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      navigate('/delivery');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Payment could not be completed.';
      setPaymentError(message);
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return <div className="stripe-page">Loading payment...</div>;
  }

  if (isError) {
    return (
      <div className="stripe-page">
        Error loading payment: {error?.message || 'Something went wrong'}
      </div>
    );
  }

  return (
    <>
      <title>Stripe Payment</title>
      <CheckoutHeader totalQuantity={totalQuantity} />

      <main className="stripe-page">
        <Link className="stripe-back-link" to="/checkout">
          <FiArrowLeft aria-hidden="true" />
          Back to checkout
        </Link>

        <div className="stripe-shell">
          <section className="stripe-panel stripe-payment-panel" aria-labelledby="stripe-title">
            <div className="stripe-brand-row">
              <div className="stripe-mark" aria-hidden="true">
                <FiCreditCard />
              </div>
              <div>
                <p className="stripe-kicker">Stripe checkout</p>
                <h1 id="stripe-title">Complete your payment</h1>
              </div>
            </div>

            <form className="stripe-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={handleInputChange('email')}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Card information
                <input
                  inputMode="numeric"
                  value={form.cardNumber}
                  onChange={handleInputChange('cardNumber')}
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </label>

              <div className="stripe-field-row">
                <label>
                  Expiry
                  <input
                    inputMode="numeric"
                    value={form.expiry}
                    onChange={handleInputChange('expiry')}
                    placeholder="MM / YY"
                    required
                  />
                </label>

                <label>
                  CVC
                  <input
                    inputMode="numeric"
                    value={form.cvc}
                    onChange={handleInputChange('cvc')}
                    placeholder="123"
                    required
                  />
                </label>
              </div>

              <label>
                Cardholder name
                <input
                  value={form.name}
                  onChange={handleInputChange('name')}
                  placeholder="Name on card"
                  required
                />
              </label>

              <label>
                Postal code
                <input
                  value={form.postalCode}
                  onChange={handleInputChange('postalCode')}
                  placeholder="10001"
                  required
                />
              </label>

              {paymentError && <p className="stripe-error">{paymentError}</p>}

              <button
                className="stripe-pay-button button-primary"
                type="submit"
                disabled={cart.length === 0 || isPaying}
              >
                {isPaying ? (
                  <span className="stripe-processing">
                    <FiCheck aria-hidden="true" />
                    Processing
                  </span>
                ) : (
                  `Pay ${formatPrice(orderTotal)}`
                )}
              </button>
            </form>
          </section>

          <aside className="stripe-panel stripe-summary" aria-label="Order summary">
            <div className="stripe-secure-note">
              <FiLock aria-hidden="true" />
              <span>Secure payment</span>
            </div>

            <h2>Order summary</h2>
            <p className="stripe-preview">
              {orderPreview || 'No items in cart'}
              {cart.length > 3 ? ` and ${cart.length - 3} more` : ''}
            </p>

            <div className="stripe-summary-lines">
              <div>
                <span>Items ({totalQuantity})</span>
                <strong>{formatPrice(itemsTotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{formatPrice(shippingTotal)}</strong>
              </div>
              <div>
                <span>Estimated tax</span>
                <strong>{formatPrice(tax)}</strong>
              </div>
              <div className="stripe-total-line">
                <span>Total</span>
                <strong>{formatPrice(orderTotal)}</strong>
              </div>
            </div>

            <div className="stripe-protection">
              <FiShield aria-hidden="true" />
              <span>This demo confirms the order without charging a real card.</span>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
