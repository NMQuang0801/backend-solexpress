import { Col, Container, Row } from 'react-bootstrap';
import { FileUpload, LabelTable } from './components';
import './styles.scss';
import { useState } from 'react';

const Home = () => {
  const [isImported, setIsImported] = useState(false);

  return (
    <Container className="d-flex flex-column gap-3">
      <Row className="justify-content-md-center">
        <Col md="auto">
          <span className="fw-bold text-center create-label-title">CREATE LABEL AU</span>
        </Col>
      </Row>
      <Row className="justify-content-md-left">
        <Col md="auto" className="create-label-info">
          <span>Lưu ý:</span>
          <ul className="d-flex flex-column gap-1">
            <li className="fw-semibold">{`Servicecode for AUPOST: :AP-SYD-AUPARCELPOST"`}</li>
            <li className="fw-semibold">{`Servicecode for TOLL: "AP-AU-TOLLSTA-SYD"`}</li>
            <li className="fw-semibold">{`Servicecode for AUPOST: "AP-SYD-AUPARCELPOST"`}</li>
            <li className="fw-semibold">{`Servicecode for TOLL: "AP-AU-TOLLSTA-MEL"`}</li>
          </ul>
        </Col>
      </Row>
      <FileUpload setIsImported={setIsImported} />
      <LabelTable isImported={isImported} setIsImported={setIsImported} />
    </Container>
  );
};

export default Home;
