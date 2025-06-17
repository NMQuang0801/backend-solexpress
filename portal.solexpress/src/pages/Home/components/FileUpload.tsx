import { Button, Col, Form, Row } from 'react-bootstrap';

const FileUpload = () => {
  return (
    <Row>
      <Col xs={6} className="file-upload">
        <Row className="w-100 mx-auto">
          <a href={'/static/label-sample.zip'} download className="btn-import-sample">
            CSV IMPORT SAMPLE
          </a>
        </Row>
        <Row className="d-flex align-items-center justify-content-between w-100 mx-auto">
          <Col xs={8} className="px-0">
            <Form.Group controlId="formFile">
              <Form.Control type="file" />
            </Form.Group>
          </Col>
          <Col xs={3} className="px-0">
            <Button className="w-100" variant="primary">
              Create label
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default FileUpload;
