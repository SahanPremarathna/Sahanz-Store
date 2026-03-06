import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { getThemeLogoPath } from "../theme/themeAssets";

function handleScrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function FooterIcon({ children }) {
  return <span className="site-footer-icon">{children}</span>;
}

export default function SiteFooter() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const logoSrc = getThemeLogoPath(isDark);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <span className="site-footer-kicker">Sahanz Network</span>
          <Link className="site-footer-brand-row" to="/">
            <img alt="Sahanz Store" className="site-footer-logo" src={logoSrc} />
            <strong>Sahanz Store</strong>
          </Link>
          <p className="muted">
            Everyday shopping, seller listings, and delivery flow in one storefront.
          </p>
          <div className="site-footer-badges">
            <span className="site-footer-badge">Customer storefront</span>
            <span className="site-footer-badge">Seller tools</span>
            <span className="site-footer-badge">Delivery flow</span>
          </div>
          <div className="site-footer-actions">
            <button className="ghost-button site-footer-top" onClick={handleScrollToTop} type="button">
              Back to top
            </button>
            <Link className="site-footer-inline-link" to="/">
              Open storefront
            </Link>
          </div>
        </div>

        <div className="site-footer-column">
          <span className="site-footer-title">Browse</span>
          <div className="site-footer-links">
            <Link to="/">
              <FooterIcon>
                <svg fill="none" viewBox="0 0 24 24">
                  <path d="M4 11.5L12 5L20 11.5V19H15V14H9V19H4V11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </FooterIcon>
              <span>Home</span>
            </Link>
            <Link to="/categories">
              <FooterIcon>
                <svg fill="none" viewBox="0 0 24 24">
                  <rect x="4" y="5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="4" y="13" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="13" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </FooterIcon>
              <span>All categories</span>
            </Link>
            {user ? (
              <Link to="/profile">
                <FooterIcon>
                  <svg fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 19C5.9 15.9 8.48 14.5 12 14.5C15.52 14.5 18.1 15.9 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </FooterIcon>
                <span>My profile</span>
              </Link>
            ) : (
              <Link to="/login">
                <FooterIcon>
                  <svg fill="none" viewBox="0 0 24 24">
                    <path d="M10 6H7C5.895 6 5 6.895 5 8V16C5 17.105 5.895 18 7 18H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M13 8L17 12L13 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </FooterIcon>
                <span>Log in</span>
              </Link>
            )}
          </div>
        </div>

        <div className="site-footer-column">
          <span className="site-footer-title">Portals</span>
          <div className="site-footer-links">
            <Link to="/login/store-owner">
              <FooterIcon>
                <svg fill="none" viewBox="0 0 24 24">
                  <path d="M4 10L6.2 6H17.8L20 10V18H4V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 18V13H15V18" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </FooterIcon>
              <span>Store owner</span>
            </Link>
            <Link to="/login/delivery">
              <FooterIcon>
                <svg fill="none" viewBox="0 0 24 24">
                  <path d="M4 7H14V15H4V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M14 10H17L20 13V15H14V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </FooterIcon>
              <span>Delivery partner</span>
            </Link>
            {user?.role === "seller" ? (
              <Link to="/seller">
                <FooterIcon>
                  <svg fill="none" viewBox="0 0 24 24">
                    <path d="M5 19V10L12 5L19 10V19H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 19V13H15V19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </FooterIcon>
                <span>Seller portal</span>
              </Link>
            ) : null}
            {user?.role === "delivery" ? (
              <Link to="/delivery">
                <FooterIcon>
                  <svg fill="none" viewBox="0 0 24 24">
                    <path d="M7 6H17V18H7V6Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M10 10H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M10 14H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </FooterIcon>
                <span>Delivery portal</span>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="site-footer-column">
          <span className="site-footer-title">Support</span>
          <div className="site-footer-links">
            <a href="mailto:support@sahanz.store">
              <FooterIcon>
                <svg fill="none" viewBox="0 0 24 24">
                  <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 8L12 13L19 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </FooterIcon>
              <span>support@sahanz.store</span>
            </a>
            <a href="tel:+94770000000">
              <FooterIcon>
                <svg fill="none" viewBox="0 0 24 24">
                  <path d="M8.5 5.5L10.5 9.5L8.8 11.2C9.74 13.11 10.89 14.26 12.8 15.2L14.5 13.5L18.5 15.5L17.9 18C17.75 18.63 17.19 19.08 16.54 19.07C9.85 18.87 5.13 14.15 4.93 7.46C4.92 6.81 5.37 6.25 6 6.1L8.5 5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </FooterIcon>
              <span>+94 77 000 0000</span>
            </a>
            <div className="site-footer-note">
              <span className="site-footer-note-dot" />
              <span>Support hours: 7:00 AM to 10:00 PM</span>
            </div>
          </div>
        </div>
      </div>
      <div className="site-footer-meta">
        <span>© {currentYear} Sahanz Store. All rights reserved.</span>
        <div className="site-footer-meta-links">
          <Link to="/">Terms</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
