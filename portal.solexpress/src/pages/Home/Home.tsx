import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './styles.scss';

const FEATURES = [
  {
    to: '/cirro',
    icon: 'bi-box2-fill',
    color: '#007bff',
    bg: 'linear-gradient(135deg, #e8f4fd 0%, #d0e8ff 100%)',
    title: 'Cirro Labels',
    desc: 'Tạo và quản lý nhãn vận chuyển Cirro (AU Post, Toll). Import CSV, in nhãn hàng loạt.',
    tags: ['CSV Import', 'AU Post', 'Toll'],
  },
  {
    to: '/etower',
    icon: 'bi-box-seam-fill',
    color: '#8d23cd',
    bg: 'linear-gradient(135deg, #f3e8ff 0%, #ffeaf2 100%)',
    title: 'eTower Labels',
    desc: 'Tạo vận đơn qua eTower, in nhãn nhanh, tracking rõ ràng. Hỗ trợ export Excel.',
    tags: ['eTower API', 'Tracking', 'Excel Export'],
  },
];

const Home = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <Container className="home-page">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <div className="home-hero">
            <span className="home-greeting">{greeting}!</span>
            <h1 className="home-title">
              Chào mừng đến <span className="home-brand">SOL Express</span>
            </h1>
            <p className="home-subtitle">
              Hệ thống quản lý nhãn vận chuyển — tạo, in và theo dõi đơn hàng nhanh chóng.
            </p>
          </div>

          <Row className="g-4 home-features">
            {FEATURES.map((f) => (
              <Col md={6} key={f.to}>
                <Link to={f.to} className="home-card" style={{ background: f.bg }}>
                  <div className="home-card-icon" style={{ color: f.color }}>
                    <i className={`bi ${f.icon}`} />
                  </div>
                  <h3 className="home-card-title" style={{ color: f.color }}>
                    {f.title}
                  </h3>
                  <p className="home-card-desc">{f.desc}</p>
                  <div className="home-card-tags">
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        className="home-tag"
                        style={{ borderColor: f.color, color: f.color }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="home-card-cta" style={{ color: f.color }}>
                    Truy cập <i className="bi bi-arrow-right" />
                  </span>
                </Link>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
