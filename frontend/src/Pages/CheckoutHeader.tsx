import { Link } from 'react-router';
import './checkoutHeader.css';

interface CheckoutHeaderProps {
  totalQuantity: number;
}

export function CheckoutHeader({ totalQuantity }: CheckoutHeaderProps) {
  const itemLabel = totalQuantity === 1 ? 'item' : 'items';

  return (
    <div className="checkout-header">
      <div className="header-content">
        <Link to="/" className="checkout-logo">
          <span className="store-name">eStore</span>
        </Link>

        <div className="checkout-title">
          <h1>Checkout</h1>
          <p className="item-count">
            Reviewing {totalQuantity} {itemLabel}
          </p>
        </div>

      </div>
    </div>
  );
}
