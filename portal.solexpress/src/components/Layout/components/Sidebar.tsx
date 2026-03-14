import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isActiveSidebarMenuMobile }: { isActiveSidebarMenuMobile: boolean }) => {
  const location = useLocation();
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  const MENU_ITEMS = [
    {
      key: 'home',
      label: 'Trang chủ',
      path: '/',
      icon: <i className="bi bi-house-door-fill"></i>,
    },
    {
      key: 'cirro',
      label: 'Cirro Labels',
      path: '/cirro',
      icon: <i className="bi bi-box2-fill"></i>,
    },
    {
      key: 'etower',
      label: 'eTower Labels',
      path: '/etower',
      icon: <i className="bi bi-box-seam-fill"></i>,
    },
  ];

  return (
    <div className={`sidebar ${isActiveSidebarMenuMobile ? 'active' : ''}`}>
      <ul className="nav-menu">
        {MENU_ITEMS.map((item) => (
          <li
            key={item.key}
            className={`menu-item ${currentPath === item.path || (item.key !== 'home' && currentPath.includes(item.key)) ? 'active' : ''}`}
          >
            <Link to={item.path}>
              {item.icon}
              <span className="menu-name">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
