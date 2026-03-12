import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './assets/css/global.scss';
import Layout from './components/Layout/Layout';
import { Error, Home, Login, Etower } from './pages';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsAuthenticated(true);
      if (location.pathname.includes('login')) {
        navigate('/');
      }
    } else {
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/etower" element={<Etower />} />
      </Route>
      {!isAuthenticated && <Route path="/login" element={<Login />} />}
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default App;
