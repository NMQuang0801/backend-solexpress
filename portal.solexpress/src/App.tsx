import { Route, Routes } from 'react-router-dom';
import './assets/css/global.scss';
import Layout from './components/layout/Layout';
import { Customer, Dashboard, Login, Packet } from './pages';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/packet" element={<Packet />} />
        <Route path="/customer" element={<Customer />} />
      </Route>
    </Routes>
  );
};

export default App;
