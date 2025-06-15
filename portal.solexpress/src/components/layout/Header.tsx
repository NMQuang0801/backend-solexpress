import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          SolExpress
        </Link>
        <nav className="header__nav">
          <Link to="/" className="header__nav-item">
            Home
          </Link>
          <Link to="/about" className="header__nav-item">
            About
          </Link>
          <Link to="/contact" className="header__nav-item">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
