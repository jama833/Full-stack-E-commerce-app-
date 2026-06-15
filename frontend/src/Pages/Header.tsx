import './header.css';
import { Link } from 'react-router';
import { useCartQuery } from '../hooks/useShop';
import { getTotalQuantity } from '../utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export function Header({
  onSearch,
  searchPlaceholder = 'Search products...',
}: HeaderProps) {
  const { data: cart = [], isFetching } = useCartQuery();
  const totalQuantity = getTotalQuantity(cart);

  return (
    <div className="header">
      <Link to="/" className="logo-brand">
        <span className="store-name">eStore</span>
      </Link>

      <div className="middle-section">
        <input
          className="search-bar"
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
        />

        <button className="search-button">
          <img className="search-icon" src="/images/icons/search-icon.png" alt="Search" />
        </button>
      </div>

      <div className="right-section">
        <Link className="cart-link" to="/checkout" aria-live="polite">
          <img className="cart-icon" src="/images/icons/cart-icon.png" alt="Cart" />
          <div className={`cart-quantity ${isFetching ? 'is-updating' : ''}`}>
            {totalQuantity}
          </div>
          <div className="cart-text">Cart</div>
        </Link>
      </div>
    </div>
  );
}
