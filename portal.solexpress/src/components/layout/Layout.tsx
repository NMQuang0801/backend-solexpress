import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Layout.scss';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout__content">
        <Container className="layout__main">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;
