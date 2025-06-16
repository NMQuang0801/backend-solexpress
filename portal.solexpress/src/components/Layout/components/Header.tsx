import HorizontalLogo from '@/assets/images/logo/horizontal-logo.png';
import React, { Dispatch, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const BREADCRUMB_MAP = { '/': 'Trang chủ' };

const Header = ({
  isActiveSidebarMenuMobile,
  setIsActiveSidebarMenuMobile,
}: {
  isActiveSidebarMenuMobile: boolean;
  setIsActiveSidebarMenuMobile: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [classActive, setClassActive] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([]);

  const pathNames = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname]
  );

  useEffect(() => {
    setIsActiveSidebarMenuMobile(false);
    if (pathNames?.length === 0) {
      setBreadcrumbs([{ name: BREADCRUMB_MAP['/'], path: '/' }]);
      return;
    }
    const dataBreadCrumbs = pathNames.reduce(
      (acc: { name: string; path: string }[], pathName, index) => {
        const fullPath = `/${pathNames.slice(0, index + 1).join('/')}`;
        const matchedKey = Object.keys(BREADCRUMB_MAP).find((key) => {
          const dynamicKey = key.replace(/:\w+/g, pathName);
          return dynamicKey === fullPath;
        });

        if (matchedKey) {
          const nameKey = BREADCRUMB_MAP[matchedKey as keyof typeof BREADCRUMB_MAP];
          acc.push({
            name: nameKey,
            path: fullPath,
          });
        }
        return acc;
      },
      []
    );

    setBreadcrumbs(dataBreadCrumbs);
  }, [pathNames, setIsActiveSidebarMenuMobile]);

  const handleClickIdentityLogin = () => {
    setClassActive((prev) => (prev === 'active' ? '' : 'active'));
  };

  const handleLogout = () => {
    localStorage.setItem('token', '');
    localStorage.setItem('user', '');
    // Redirect to home page
    navigate('/login');
  };

  return (
    <header className="nav__bar">
      <div className="nav__bar__left">
        <Link to="/" className="navbar__logo__left">
          <img src={HorizontalLogo} alt="" />
        </Link>
        <ul className="breadcrumb d-lg-flex d-none">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="breadcrumb_item">
              <Link to={item.path} title={item.name}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="nav__bar__right">
        <div className={`menu__identity ${classActive}`} onClick={handleClickIdentityLogin}>
          <div className="menu__identity-login">
            <i className="bi bi-person-circle"></i>
            <span>SOL Express</span>
          </div>
          <div className="menu__identity_dropdown">
            <div className="menu__identity_dropdown_item" onClick={handleLogout}>
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>
        <div
          className="menu-sidebar-mobile d-lg-none d-flex"
          onClick={() => setIsActiveSidebarMenuMobile(!isActiveSidebarMenuMobile)}
        >
          {isActiveSidebarMenuMobile ? (
            <i className="bi bi-x-lg"></i>
          ) : (
            <i className="bi bi-list"></i>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
