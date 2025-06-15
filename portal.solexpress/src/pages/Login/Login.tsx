import { Container, Row } from 'react-bootstrap';
import { CompanyInfo, LoginForm } from './components';

const Login = () => {
  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="row w-100 shadow-lg rounded-3 overflow-hidden">
        <CompanyInfo />
        <LoginForm />
      </Row>
    </Container>
  );
};

export default Login;
