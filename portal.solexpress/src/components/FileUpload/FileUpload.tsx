import { Dispatch, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';

type ImportResponse = {
  data?: {
    success?: boolean;
    message?: string;
    data?: {
      successCount?: number;
      errorCount?: number;
      createdOrderIds?: string[];
      createErrors?: string[];
    };
  };
};

type FileUploadProps = {
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
  sampleHref?: string;
  onImport: (file: File) => Promise<ImportResponse | unknown>;
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
      const response = (await onImport(selectedFile)) as ImportResponse;
      const d = response?.data;

      if (d?.success) {
        const payload = d.data;
        const isEtowerPayload =
          payload &&
          typeof payload === 'object' &&
          !Array.isArray(payload) &&
          ('createErrors' in payload || 'createdOrderIds' in payload || 'successCount' in payload);

        let text: string;
        if (isEtowerPayload) {
          const successCount = payload.successCount ?? payload.createdOrderIds?.length ?? 0;
          const errorCount = payload.errorCount ?? payload.createErrors?.length ?? 0;
          text = `Thành công ${successCount} đơn.`;
          if (errorCount > 0) {
            text += ` ${errorCount} đơn lỗi.`;
            if (payload.createErrors?.length) {
              text += ` Chi tiết: ${payload.createErrors.join(' ')}`;
            }
          } else if (successCount) {
            text = 'Import labels thành công!';
          }
        } else {
          const count = Array.isArray(payload) ? payload.length : 0;
          text = count > 0 ? `Thành công ${count} đơn.` : 'Import labels thành công!';
        }
        setMessage({ type: 'success', text });
        setIsImported(true);
      } else {
        setMessage({
          type: 'error',
          text: d?.message || 'Có lỗi xảy ra khi import labels',
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
            IMPORT SAMPLE FILE
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
