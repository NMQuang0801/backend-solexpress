import { FileUpload, LabelTable } from '@/components';
import { labelsService } from '@/services';
import { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import './styles.scss';

const Home = () => {
  const [isImported, setIsImported] = useState(false);

  const handleAuImport = (file: File) => {
    const service = labelsService();
    return service.importLabels(file);
  };

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
      <FileUpload
        setIsImported={setIsImported}
        sampleHref="/static/label-sample.zip"
        onImport={handleAuImport}
        allowedExtensions={['.csv']}
      />
      <LabelTable isImported={isImported} setIsImported={setIsImported} />
    </Container>
  );
};

export default Home;
