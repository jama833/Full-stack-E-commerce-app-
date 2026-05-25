import './footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">About Us</h3>
            <p className="footer-text">
              We provide quality products and exceptional customer service. Your satisfaction is our priority.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#products" className="footer-link">Products</a></li>
              <li><a href="#about" className="footer-link">About</a></li>
              <li><a href="#contact" className="footer-link">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Customer Service</h3>
            <ul className="footer-links">
              <li><a href="#faq" className="footer-link">FAQ</a></li>
              <li><a href="#shipping" className="footer-link">Shipping Info</a></li>
              <li><a href="#returns" className="footer-link">Returns</a></li>
              <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Follow Us</h3>
            <div className="social-links">
              <a href="#facebook" className="social-link" aria-label="Facebook">Fb</a>
              <a href="#twitter" className="social-link" aria-label="Twitter">X</a>
              <a href="#instagram" className="social-link" aria-label="Instagram">Ig</a>
              <a href="#linkedin" className="social-link" aria-label="LinkedIn">In</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 EcommerceCo. All rights reserved.</p>
          <p className="footer-credit">Made with care by JAMA ELMI</p>
        </div>
      </div>
    </footer>
  );
}
