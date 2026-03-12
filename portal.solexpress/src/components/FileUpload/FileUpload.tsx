import { Dispatch, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';

type FileUploadProps = {
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
  sampleHref?: string;
  onImport: (file: File) => Promise<{ data?: { success?: boolean; message?: string } } | unknown>;
  allowedExtensions?: string[];
};

const FileUpload = ({
  setIsImported,
  sampleHref,
  onImport,
  allowedExtensions = ['.csv'],
}: FileUploadProps) => {
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
      setMessage({ type: 'error', text: 'Vui lòng chọn file để import' });
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();
    const isValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValidExt) {
      setMessage({
        type: 'error',
        text: `Vui lòng chọn file ${allowedExtensions.join(' hoặc ')}`,
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = (await onImport(selectedFile)) as {
        data?: { success?: boolean; message?: string };
      };

      if (response?.data?.success) {
        setMessage({ type: 'success', text: 'Import labels thành công!' });
        setIsImported(true);
      } else {
        setMessage({
          type: 'success',
          text: response?.data?.message || 'Có lỗi xảy ra khi import labels',
        });
      }

      setSelectedFile(null);
      const fileInput = document.getElementById('formFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: 'Có lỗi xảy ra khi import labels',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row>
      <Col xxs={12} lg={6} className="file-upload">
        <Row className="w-100 mx-auto">
          <a href={sampleHref || '/static/label-sample.zip'} download className="btn-import-sample">
            CSV IMPORT SAMPLE
          </a>
        </Row>
        <Row className="d-flex align-items-center justify-content-between gap-1 w-100 mx-auto">
          <Col xs={12} xl={8} className="px-0">
            <Form.Group controlId="formFile">
              <Form.Control
                type="file"
                accept={allowedExtensions.join(',')}
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col xs={12} xl={3} className="px-0">
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
