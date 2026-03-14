import { Badge, Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import { etowerLabelsService } from '@/services';
import { FileUpload } from '@/components';
import { EtowerTable } from './components';
import './styles.scss';

const Etower = () => {
  const [isImported, setIsImported] = useState(false);
  const [showNote, setShowNote] = useState(true);

  const handleEtowerImport = (file: File) => {
    const service = etowerLabelsService();
    return service.importLabels(file);
  };

  return (
    <Container className="d-flex flex-column gap-3 etw-page">
      <Row className="justify-content-md-center text-center">
        <Col md="auto" className="d-flex flex-column align-items-center gap-1">
          <span className="fw-bold etw-create-label-title">eTower Label Portal</span>
          <span className="etw-subtitle">
            Tạo vận đơn qua eTower, in nhãn nhanh, tracking rõ ràng cho từng đơn hàng.
          </span>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Badge bg="light" text="dark" className="etw-badge">
              <i className="bi bi-lightning-charge-fill me-1" />
              Bulk import CSV
            </Badge>
            <Badge bg="light" text="dark" className="etw-badge">
              <i className="bi bi-printer-fill me-1" />
              Auto Print Label
            </Badge>
            <Badge bg="light" text="dark" className="etw-badge">
              <i className="bi bi-truck me-1" />
              eTower Integration
            </Badge>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12}>
          <div className="etw-card etw-card--left">
            <div className="etw-card-header">
              <span className="etw-card-title">Cấu hình & Import CSV</span>
              <span className="etw-card-desc">
                Tải file CSV theo mẫu, hệ thống sẽ tự gửi sang eTower để tạo shipping order.
              </span>
            </div>

            <div className="etw-note-box">
              <button
                type="button"
                className="etw-note-toggle"
                onClick={() => setShowNote((prev) => !prev)}
              >
                <span className="etw-note-title">Lưu ý cho eTower</span>
                <i className={`bi ${showNote ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
              </button>

              {showNote && (
                <ul className="d-flex flex-column gap-1 etw-note-content">
                  <li>
                    Sử dụng đúng <strong>serviceCode</strong> do eTower / nhà vận chuyển cung cấp.
                  </li>
                  <li>
                    <strong>referenceNo</strong> phải là duy nhất cho từng đơn để tránh bị trùng.
                  </li>
                  <li>
                    Kiểm tra tổng <strong>invoiceValue</strong> gần bằng sum(itemCount × unitValue)
                    (sai số &lt;= 0.1).
                  </li>
                </ul>
              )}
            </div>

            <div className="etw-upload-wrapper">
              <FileUpload
                setIsImported={setIsImported}
                sampleHref="/static/etower-create-sample.xlsx"
                onImport={handleEtowerImport}
                allowedExtensions={['.csv', '.xlsx']}
              />
            </div>
          </div>
        </Col>
        <Col xs={12}>
          <div className="etw-card etw-card--right">
            <div className="etw-card-header d-flex justify-content-between align-items-center mb-2">
              <div>
                <span className="etw-card-title">Danh sách nhãn eTower</span>
              </div>
            </div>
            <EtowerTable isImported={isImported} setIsImported={setIsImported} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Etower;
