import './homepage.css';
import { useMemo, useState } from 'react';
import {
  useAddToCartMutation,
  useProductsQuery,
} from '../hooks/useShop';
import type { Product } from '../types';
import { formatPrice, getImageSrc, getRatingImageSrc } from '../utils';
import { Footer } from './Footer';
import { Header } from './Header';

const HERO_LAYOUT_CLASSES = [
  'hero-product hero-product-main',
  'hero-product hero-product-top',
  'hero-product hero-product-bottom',
] as const;

export function HomePage() {
  const { data: products = [], isLoading, isError } = useProductsQuery();
  const addToCartMutation = useAddToCartMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

  const heroProducts = useMemo(() => products.slice(0, 3), [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  const searchPlaceholder = products.length
    ? `Search ${products.length} products...`
    : 'Search products...';

  const pendingProductId = addToCartMutation.isPending
    ? addToCartMutation.variables?.productId
    : null;

  const scrollToProducts = () => {
    document.querySelector('.products-grid')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate(
      { productId: product.id, quantity: quantities[product.id] ?? 1 },
      {
        onSuccess: () => {
          setAddedProductIds((current) => new Set(current).add(product.id));
          window.setTimeout(() => {
            setAddedProductIds((current) => {
              const next = new Set(current);
              next.delete(product.id);
              return next;
            });
          }, 2000);
        },
        onError: () => window.alert('Could not add this item. Please try again.'),
      }
    );
  };

  return (
    <>
      <title>Ecommerce</title>
      <Header onSearch={setSearchQuery} searchPlaceholder={searchPlaceholder} />

      <div className="home-page">
        <section className="hero-section" aria-label="Featured shopping collection">
          <div className="hero-copy">
            <div className="hero-kicker">Fresh picks every day</div>
            <h1>Upgrade the cart before the weekend lands.</h1>
            <p>
              Discover wardrobe staples, home products, and everyday essentials with a
              simple checkout.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-primary-button button-primary"
                onClick={scrollToProducts}
              >
                Shop collection
              </button>
              <button
                type="button"
                className="hero-secondary-button"
                onClick={() => setSearchQuery('shoes')}
              >
                Explore shoes
              </button>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />

            {heroProducts.map((product, index) => (
              <div key={product.id} className={HERO_LAYOUT_CLASSES[index]}>
                <img src={getImageSrc(product.image)} alt={product.name} />
              </div>
            ))}

            <div className="hero-badge hero-badge-left">
              <span>4.9</span>
              Top rated
            </div>
            <div className="hero-badge hero-badge-right">
              <span>24h</span>
              Fast dispatch
            </div>
          </div>
        </section>

        <div className="products-grid">
          {isLoading || isError || filteredProducts.length === 0 ? (
            <div className="no-products-message">
              {isLoading && <p>Loading products...</p>}
              {isError && <p>Could not load products from the server.</p>}
              {!isLoading && !isError && filteredProducts.length === 0 && (
                <p>No products found matching your search.</p>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const quantity = quantities[product.id] ?? 1;
              const isAdding = pendingProductId === product.id;
              const isAdded = addedProductIds.has(product.id);

              return (
                <div key={product.id} className="product-container">
                  <div className="product-image-container">
                    <img
                      className="product-image"
                      src={getImageSrc(product.image)}
                      alt={product.name}
                    />
                  </div>

                  <div className="product-name limit-text-to-2-lines">{product.name}</div>

                  <div className="product-rating-container">
                    <img
                      className="product-rating-stars"
                      src={getRatingImageSrc(product.rating.stars)}
                      alt={`${product.rating.stars} star rating`}
                    />
                    <div className="product-rating-count link-primary">
                      {product.rating.count}
                    </div>
                  </div>

                  <div className="product-price">{formatPrice(product.priceCents)}</div>

                  <div className="product-quantity-container">
                    <select
                      value={quantity}
                      onChange={(event) =>
                        setQuantities((current) => ({
                          ...current,
                          [product.id]: Number(event.target.value),
                        }))
                      }
                    >
                      {Array.from({ length: 10 }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="product-spacer" />

                  <div className={`added-to-cart ${isAdded ? 'show' : ''}`}>
                    <img src="/images/icons/checkmark.png" alt="" />
                    Added
                  </div>

                  <button
                    type="button"
                    className="add-to-cart-button button-primary"
                    onClick={() => handleAddToCart(product)}
                    disabled={isAdding}
                    aria-busy={isAdding}
                  >
                    {isAdded ? 'Added!' : isAdding ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
