import dayjs from 'dayjs';
import { Link } from 'react-router';
import type { IconType } from 'react-icons';
import { FiCheckCircle, FiClock, FiHome, FiPackage, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { Footer } from './Footer';
import './delivery.css';

interface TimelineStep {
  title: string;
  date: string;
  status?: 'complete' | 'active';
  Icon: IconType;
}

export function DeliveryPage() {
  const orderDate = dayjs();
  const deliveryDate = orderDate.add(5, 'day');
  const orderNumber = `EST-${orderDate.format('MMDD')}-${orderDate.format('HHmm')}`;
  const timelineSteps: TimelineStep[] = [
    {
      title: 'Order placed',
      date: orderDate.format('[Today], h:mm A'),
      status: 'complete',
      Icon: FiShoppingBag,
    },
    {
      title: 'Packing items',
      date: orderDate.add(1, 'day').format('dddd, MMM D'),
      status: 'active',
      Icon: FiPackage,
    },
    {
      title: 'Out for delivery',
      date: deliveryDate.subtract(1, 'day').format('dddd, MMM D'),
      Icon: FiTruck,
    },
    {
      title: 'Arrives at your door',
      date: deliveryDate.format('dddd, MMM D'),
      Icon: FiHome,
    },
  ];

  return (
    <>
      <title>Delivery</title>

      <main className="delivery-page">
        <section className="delivery-hero" aria-labelledby="delivery-title">
          <div className="delivery-success-icon" aria-hidden="true">
            <FiCheckCircle />
          </div>

          <div className="delivery-copy">
            <p className="delivery-kicker">Order confirmed</p>
            <h1 id="delivery-title">Your delivery is on the way.</h1>
            <p>
              Thanks for shopping with us. We are preparing your items now and will keep your
              delivery moving smoothly.
            </p>
          </div>

          <div className="delivery-card">
            <div>
              <span>Estimated delivery</span>
              <strong>{deliveryDate.format('dddd, MMMM D')}</strong>
            </div>
            <div>
              <span>Order number</span>
              <strong>{orderNumber}</strong>
            </div>
            <div>
              <span>Placed</span>
              <strong>{orderDate.format('MMM D, YYYY h:mm A')}</strong>
            </div>
          </div>
        </section>

        <section className="delivery-timeline" aria-label="Delivery progress">
          {timelineSteps.map(({ title, date, status = '', Icon }) => (
            <div key={title} className={`timeline-step ${status}`.trim()}>
              <span className="timeline-icon" aria-hidden="true">
                <Icon />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{date}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="delivery-actions" aria-label="Delivery actions">
          <div className="delivery-note">
            <FiClock aria-hidden="true" />
            <span>Delivery updates will appear here as your order moves forward.</span>
          </div>

          <Link className="delivery-shop-link button-primary" to="/">
            Continue Shopping
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
