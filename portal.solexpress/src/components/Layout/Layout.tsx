import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer, Header, Sidebar } from './components';
import './styles.scss';

const Layout = () => {
  const [isActiveSidebarMenuMobile, setIsActiveSidebarMenuMobile] = useState(false);

  return (
    <React.Fragment>
      <Header
        isActiveSidebarMenuMobile={isActiveSidebarMenuMobile}
        setIsActiveSidebarMenuMobile={setIsActiveSidebarMenuMobile}
      />
      <div className="body_container">
        <div className="main__sidebar__content">
          <Sidebar isActiveSidebarMenuMobile={isActiveSidebarMenuMobile} />
          <div className="main-content">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
};

export default Layout;
