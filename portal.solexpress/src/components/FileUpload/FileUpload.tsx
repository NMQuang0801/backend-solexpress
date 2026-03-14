import { Dispatch, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useLoading, useAlert } from '@/contexts';
import { ApiResponse, getErrorMessages } from '@/types/response';

type FileUploadProps = {
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
  sampleHref?: string;
  onImport: (file: File) => Promise<{ data: ApiResponse }>;
  allowedExtensions?: string[];
};

const FileUpload = ({
  setIsImported,
  sampleHref,
  onImport,
  allowedExtensions = ['.csv'],
}: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const { showAlert } = useAlert();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showAlert('error', 'Vui lòng chọn file để import');
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();
    const isValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValidExt) {
      showAlert('error', `Vui lòng chọn file ${allowedExtensions.join(' hoặc ')}`);
      return;
    }

    showLoading();

    try {
      const { data: res } = await onImport(selectedFile);

      if (res.messages) {
        showAlert('success', res.messages);
      }
      if (res.errorMessages?.length) {
        showAlert('error', res.errorMessages);
      }

      setIsImported(true);
      setSelectedFile(null);
      const fileInput = document.getElementById('formFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi import labels'));
    } finally {
      hideLoading();
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
              />
            </Form.Group>
          </Col>
          <Col xs={12} xl={3} className="px-0">
            <Button
              className="w-100"
              variant="primary"
              onClick={handleImport}
              disabled={!selectedFile}
            >
              Import Labels
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default FileUpload;
