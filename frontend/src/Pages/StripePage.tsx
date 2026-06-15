import './stripe.css';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiArrowLeft, FiCheck, FiCreditCard, FiLock, FiShield } from 'react-icons/fi';
import { useCartQuery, usePlaceOrderMutation } from '../hooks/useShop';
import { formatPrice, getOrderSummary } from '../utils';
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

const DEFAULT_PAYMENT_FORM: PaymentForm = {
  email: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
  name: '',
  postalCode: '',
};

export function StripePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PaymentForm>(DEFAULT_PAYMENT_FORM);
  const [paymentError, setPaymentError] = useState('');

  const { data: cart = [], isLoading, isError, error } = useCartQuery();
  const placeOrderMutation = usePlaceOrderMutation();
  const summary = getOrderSummary(cart);

  const orderPreview = useMemo(
    () => cart.slice(0, 3).map((item) => item.product.name).join(', '),
    [cart]
  );

  const handleInputChange =
    (field: keyof PaymentForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setPaymentError('');
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cart.length === 0) {
      setPaymentError('Your cart is empty.');
      return;
    }

    placeOrderMutation.mutate('1', {
      onSuccess: () => navigate('/delivery'),
      onError: (mutationError) => {
        const message =
          mutationError instanceof Error
            ? mutationError.message
            : 'Payment could not be completed.';
        setPaymentError(message);
      },
    });
  };

  if (isLoading) {
    return <div className="stripe-page">Loading payment...</div>;
  }

  if (isError) {
    return (
      <div className="stripe-page">
        Error loading payment: {error?.message ?? 'Something went wrong'}
      </div>
    );
  }

  return (
    <>
      <title>Stripe Payment</title>
      <CheckoutHeader totalQuantity={summary.totalQuantity} />

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
                disabled={cart.length === 0 || placeOrderMutation.isPending}
              >
                {placeOrderMutation.isPending ? (
                  <span className="stripe-processing">
                    <FiCheck aria-hidden="true" />
                    Processing
                  </span>
                ) : (
                  `Pay ${formatPrice(summary.orderTotal)}`
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
                <span>Items ({summary.totalQuantity})</span>
                <strong>{formatPrice(summary.itemsTotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>{formatPrice(summary.shippingTotal)}</strong>
              </div>
              <div>
                <span>Estimated tax</span>
                <strong>{formatPrice(summary.tax)}</strong>
              </div>
              <div className="stripe-total-line">
                <span>Total</span>
                <strong>{formatPrice(summary.orderTotal)}</strong>
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
