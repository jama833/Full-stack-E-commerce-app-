import './homepage.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cartQueryKey } from '../hooks/useCartQuery';
import { Header } from './Header';
import { Footer } from './Footer';
import type { Product } from '../types/interfaces';

const heroProducts = [
  {
    src: '/images/products/men-athletic-shoes-white.jpg',
    alt: 'White athletic shoes',
    className: 'hero-product hero-product-main',
  },
  {
    src: '/images/products/black-and-silver-espresso-maker.jpg',
    alt: 'Black and silver espresso maker',
    className: 'hero-product hero-product-top',
  },
  {
    src: '/images/products/women-striped-beach-dress.jpg',
    alt: 'Striped beach dress',
    className: 'hero-product hero-product-bottom',
  },
];

export function HomePage() {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get<Product[]>('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchPlaceholder = products.length
    ? `Search ${products.length} products...`
    : 'Search products...';

  const getImageSrc = (imagePath: string) =>
    imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  const getRoundedRating = (stars: number) => Math.round(stars * 2) / 2;

  const scrollToProducts = () => {
    document.querySelector('.products-grid')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const updateQuantity = (productId: string, value: string) => {
    setQuantities({
      ...quantities,
      [productId]: Number(value),
    });
  };

  const addToCart = async (product: Product) => {
    try {
      await axios.post('/api/cart-items', {
        productId: product.id,
        quantity: quantities[product.id] || 1,
      });

      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      setAddedProducts({ ...addedProducts, [product.id]: true });

      setTimeout(() => {
        setAddedProducts((current) => ({
          ...current,
          [product.id]: false,
        }));
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Could not add this item. Please try again.');
    }
  };

  return (
    <>
      <title>Ecommerce</title>
      <Header
        onSearch={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
      />

      <div className="home-page">
        <section className="hero-section" aria-label="Featured shopping collection">
          <div className="hero-copy">
            <div className="hero-kicker">Fresh picks every day</div>
            <h1>Upgrade the cart before the weekend lands.</h1>
            <p>
              Discover wardrobe staples, home products, and everyday essentials with a simple
              checkout.
            </p>

            <div className="hero-actions">
              <button className="hero-primary-button button-primary" onClick={scrollToProducts}>
                Shop collection
              </button>
              <button className="hero-secondary-button" onClick={() => setSearchQuery('shoes')}>
                Explore shoes
              </button>
            </div>
          </div>

          <div className="hero-stage" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one"></div>
            <div className="hero-orbit hero-orbit-two"></div>

            {heroProducts.map((item) => (
              <div key={item.src} className={item.className}>
                <img src={item.src} alt={item.alt} />
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
          {filteredProducts.length === 0 ? (
            <div className="no-products-message">
              <p>No products found matching your search.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-container">
                <div className="product-image-container">
                  <img className="product-image" src={getImageSrc(product.image)} alt={product.name} />
                </div>

                <div className="product-name limit-text-to-2-lines">{product.name}</div>

                <div className="product-rating-container">
                  <img
                    className="product-rating-stars"
                    src={`/images/ratings/rating-${getRoundedRating(product.rating.stars) * 10}.png`}
                    alt={`${product.rating.stars} star rating`}
                  />
                  <div className="product-rating-count link-primary">
                    {product.rating.count}
                  </div>
                </div>

                <div className="product-price">
                  ${(product.priceCents / 100).toFixed(2)}
                </div>

                <div className="product-quantity-container">
                  <select
                    value={quantities[product.id] || 1}
                    onChange={(event) => updateQuantity(product.id, event.target.value)}
                  >
                    {Array.from({ length: 10 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-spacer"></div>

                <div className={`added-to-cart ${addedProducts[product.id] ? 'show' : ''}`}>
                  <img src="/images/icons/checkmark.png" alt="" />
                  Added
                </div>

                <button
                  className="add-to-cart-button button-primary"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
