import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './styles.scss';

const Error = () => {
  return (
    <Container className="error-page">
      <div className="error-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Oops! Trang không tồn tại</h1>
        <p className="error-message">
          Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="error-actions">
          <Link to="/">
            <Button variant="primary" size="lg" className="me-3">
              <i className="bi bi-house-door me-2"></i>
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default Error;
