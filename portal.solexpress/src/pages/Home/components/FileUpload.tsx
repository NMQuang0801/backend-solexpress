import { useState } from 'react';
import { Button, Col, Form, Row, Alert } from 'react-bootstrap';
import { labelsService } from '@/services';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file CSV để import' });
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file CSV' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const service = labelsService();
      await service.importLabels(selectedFile);
      setMessage({ type: 'success', text: 'Import labels thành công!' });
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('formFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi import labels',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <Form.Control
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col xs={3} className="px-0">
            <Button
              className="w-100"
              variant="primary"
              onClick={handleImport}
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? 'Importing...' : 'Import Labels'}
            </Button>
          </Col>
        </Row>
        {message && (
          <Row className="mt-2">
            <Col>
              <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
                {message.text}
              </Alert>
            </Col>
          </Row>
        )}
      </Col>
    </Row>
  );
};

export default FileUpload;
