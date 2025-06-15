import { Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CompanyInfo = () => {
  return (
    <Col
      sm={6}
      className="d-none d-lg-flex flex-column justify-content-center align-items-start bg-secondary bg-gradient text-white p-5 gap-2"
    >
      <Image
        src="https://solexpress.skytrack.top/view/logo1.png"
        width={'auto'}
        height={100}
        rounded
      />
      <div className="d-flex flex-column gap-1 mb-2">
        <div className="fs-2 fw-bold text-uppercase">Đơn vị vận chuyển quốc tế</div>
        <div className="fs-5 fw-semibold text-uppercase">Uy tín - Tận tâm - Giá rẻ</div>
      </div>
      <Button href="tel:0934379488" variant="primary" className="fw-bold px-4 mb-3">
        LIÊN HỆ NGAY
      </Button>
      <div className="d-flex flex-column gap-2 mb-2">
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-telephone-fill"></i>
          <Link
            to="tel:+0934379488"
            rel="noopener noreferrer"
            className="text-decoration-none text-white fw-semibold"
          >
            0934.379.488
          </Link>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-globe"></i>
          <Link
            to="https://solexpress.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-white fw-semibold"
          >
            solexpress.vn
          </Link>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-envelope-at-fill"></i>
          <Link
            to="mailto:info.solexpress@gmail.com"
            rel="noopener noreferrer"
            className="text-decoration-none text-white fw-semibold"
          >
            info.solexpress@gmail.com
          </Link>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-geo-alt-fill"></i>
          <Link
            to="https://maps.app.goo.gl/ChxFAzMB5ureaQh29"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-white fw-semibold"
          >
            159/30 Hoàng Văn Thụ, Phường 8, Quận Phú Nhuận, TP. Hồ Chí Minh
          </Link>
        </div>
      </div>
    </Col>
  );
};

export default CompanyInfo;
