import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <h3 className="footer__title">About Us</h3>
            <p className="footer__text">
              SolExpress is your trusted partner in logistics and transportation solutions.
            </p>
          </div>
          <div className="footer__section">
            <h3 className="footer__title">Contact</h3>
            <p className="footer__text">Email: info@solexpress.com</p>
            <p className="footer__text">Phone: +1 234 567 890</p>
          </div>
        </div>
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} SolExpress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
