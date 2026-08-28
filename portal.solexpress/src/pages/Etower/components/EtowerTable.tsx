import { etowerLabelsService } from '@/services';
import { useLoading, useAlert } from '@/contexts';
import { useTableSelection, useTableSort } from '@/hooks';
import { getErrorMessages } from '@/types/response';
import { TablePagination } from '@/components';
import { Label, LabelsResponse } from '@/types/label';
import { IUser } from '@/types/user';
import moment from 'moment';
import React, { Dispatch, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { EtowerTableColumns } from '../types';

type EtowerTableProps = {
  isImported: boolean;
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
};

const EtowerTable = ({ isImported, setIsImported }: EtowerTableProps) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [total, setTotal] = useState(0);
  const [printErrorCount, setPrintErrorCount] = useState(0);

  const currentUser = useMemo<IUser | null>(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as IUser;
    } catch {
      return null;
    }
  }, []);
  const isAdmin = currentUser?.role === 'admin';

  const { sortField, isDesc, handleSort, resetSort } = useTableSort();
  const { selectedIds, isAllSelected, toggleSelect, toggleSelectAll, clearSelection } =
    useTableSelection(labels);
  const { showLoading, hideLoading } = useLoading();
  const { showAlert } = useAlert();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    if (isImported) {
      resetSort();
      setPageIndex(1);
      setPageSize(20);
      setDateFrom('');
      setDateTo('');
      setReferenceNo('');
      setTrackingNo('');
      fetchLabels();
      setIsImported(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImported]);

  useEffect(() => {
    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, sortField, isDesc]);

  useEffect(() => {
    if (isAdmin) {
      fetchPrintErrorCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isImported]);

  const fetchPrintErrorCount = async () => {
    try {
      const service = etowerLabelsService();
      const response = await service.getPrintErrors();
      setPrintErrorCount(response.data?.data?.total || 0);
    } catch {
      setPrintErrorCount(0);
    }
  };

  const getFilters = () => ({
    dateFrom: dateFrom.trim() || undefined,
    dateTo: dateTo.trim() || undefined,
    referenceNo: referenceNo.trim() || undefined,
    trackingNo: trackingNo.trim() || undefined,
  });

  const fetchLabels = async (
    page = pageIndex,
    filters?: { dateFrom?: string; dateTo?: string; referenceNo?: string; trackingNo?: string }
  ) => {
    setLoading(true);
    try {
      const service = etowerLabelsService();
      const f = filters ?? getFilters();
      const response = await service.getLabels(page, pageSize, f, sortField, isDesc);
      const data: LabelsResponse = response.data.data;
      setLabels(data.data || []);
      setTotal(data.total || 0);
      clearSelection();
    } catch (err) {
      console.error('Error fetching etower labels:', err);
      showAlert('error', getErrorMessages(err, 'Có lỗi xảy ra khi tải danh sách labels'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setPageIndex(1);
    fetchLabels(1);
  };

  const resetFilters = () => {
    resetSort();
    setPageIndex(1);
    setPageSize(20);
    setDateFrom('');
    setDateTo('');
    setReferenceNo('');
    setTrackingNo('');
    fetchLabels(1, {
      dateFrom: undefined,
      dateTo: undefined,
      referenceNo: undefined,
      trackingNo: undefined,
    });
  };

  const handleReferenceNoChange = (value: string) => {
    setReferenceNo(value);
  };

  const handleTrackingNoChange = (value: string) => {
    setTrackingNo(value);
  };

  const handlePageChange = (page: number) => setPageIndex(page);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(1);
  };

  const handleSortColumn = (field: string) => {
    handleSort(field);
    setPageIndex(1);
  };

  const downloadSelected = async (merged: boolean) => {
    showLoading();
    try {
      const service = etowerLabelsService();
      const response = await service.downloadLabelsZip(selectedIds, merged);

      const blob = new Blob([response.data], {
        type: merged ? 'application/pdf' : 'application/zip',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = merged
        ? `etower-labels-merged-${new Date().toISOString().slice(0, 10)}.pdf`
        : `etower-labels-${new Date().toISOString().slice(0, 10)}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showAlert('success', 'Download labels thành công!');
    } catch (error) {
      console.error('Error downloading labels:', error);
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi download labels'));
    } finally {
      hideLoading();
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) return;
    setShowDownloadModal(true);
  };

  const handleExportExcel = async () => {
    if (selectedIds.length === 0) return;

    const selectedOrderIds = labels
      .filter((label) => selectedIds.includes(label.id))
      .map((label) => label.orderId)
      .filter(Boolean);

    if (!selectedOrderIds.length) {
      showAlert('error', 'Không tìm thấy Order ID cho các labels đã chọn.');
      return;
    }

    showLoading();
    try {
      const service = etowerLabelsService();
      const response = await service.exportExcel(selectedOrderIds);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `etower-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert('success', 'Export Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi export Excel'));
    } finally {
      hideLoading();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const selectedOrderIds = labels
      .filter((label) => selectedIds.includes(label.id))
      .map((label) => label.orderId)
      .filter(Boolean);

    if (!selectedOrderIds.length) {
      showAlert('error', 'Không tìm thấy Order ID cho các labels đã chọn.');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${selectedOrderIds.length} đơn đã chọn? Đơn đã đóng trên eTower không thể xóa.`
    );
    if (!confirmed) return;

    showLoading();
    try {
      const service = etowerLabelsService();
      const response = await service.deleteOrders(selectedOrderIds);
      const res = response.data?.data;
      const successCount = res?.successCount ?? 0;
      const errorCount = res?.errorCount ?? 0;
      const msg =
        response.data?.messages ||
        (errorCount > 0
          ? `Đã xóa ${successCount} đơn. Lỗi ${errorCount} đơn.`
          : `Đã xóa ${successCount} đơn.`);
      showAlert('success', msg);
      if (successCount > 0) fetchLabels(pageIndex);
    } catch (error) {
      console.error('Error deleting orders:', error);
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi xóa đơn'));
    } finally {
      hideLoading();
    }
  };

  const handleRetryPrintByRef = async () => {
    if (!referenceNo.trim() && !trackingNo.trim()) {
      showAlert('error', 'Vui lòng nhập Reference No hoặc Tracking No để retry in nhãn.');
      return;
    }

    showLoading();
    try {
      const service = etowerLabelsService();
      const response = await service.retryPrintByRef(
        referenceNo.trim() || undefined,
        trackingNo.trim() || undefined
      );
      showAlert('success', response.data?.messages || 'Retry in nhãn thành công.');
      fetchLabels(pageIndex);
      if (isAdmin) fetchPrintErrorCount();
    } catch (error) {
      console.error('Error retrying print by ref:', error);
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi retry in nhãn'));
    } finally {
      hideLoading();
    }
  };

  const handleAdminRetryErrors = async () => {
    if (printErrorCount === 0) {
      showAlert('error', 'Không có lỗi in nhãn cần retry.');
      return;
    }

    const confirmed = window.confirm(`Bạn có chắc muốn retry ${printErrorCount} đơn lỗi in nhãn?`);
    if (!confirmed) return;

    showLoading();
    try {
      const service = etowerLabelsService();
      const response = await service.retryAdminPrintErrors();
      showAlert('success', response.data?.messages || 'Retry lỗi in nhãn thành công.');
      fetchLabels(pageIndex);
      fetchPrintErrorCount();
    } catch (error) {
      console.error('Error retrying admin print errors:', error);
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi retry lỗi in nhãn'));
    } finally {
      hideLoading();
    }
  };

  if (loading) {
    return (
      <Row className="justify-content-center">
        <Col xs="auto">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Col>
      </Row>
    );
  }

  return (
    <React.Fragment>
      <div className="etw-filters">
        <Row className="search-label g-2">
          <Col xs={12} sm={6}>
            <Form.Group>
              <Form.Label className="small mb-1">Reference No</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder={'Mỗi dòng một reference\nVí dụ:\nREF001\nREF002'}
                value={referenceNo}
                onChange={(e) => handleReferenceNoChange(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Group>
              <Form.Label className="small mb-1">Tracking No</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder={'Mỗi dòng một tracking\nVí dụ:\n123456\n789012'}
                value={trackingNo}
                onChange={(e) => handleTrackingNoChange(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="search-label g-2">
          <Col xs={12} sm={4} md={3}>
            <Form.Group>
              <Form.Label className="small mb-1">Từ ngày</Form.Label>
              <Form.Control
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} sm={4} md={3}>
            <Form.Group>
              <Form.Label className="small mb-1">Đến ngày</Form.Label>
              <Form.Control
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col
            xs={12}
            sm={4}
            md={6}
            className="d-flex align-items-end justify-content-sm-end mt-2 mt-sm-0"
          >
            <div className="d-flex justify-content-start gap-2 w-100 etw-filter-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={applyFilters}>
                Tìm kiếm
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={handleRetryPrintByRef}
              >
                <i className="bi bi-arrow-repeat me-1" />
                Retry in nhãn
              </button>
            </div>
          </Col>
        </Row>
      </div>
      <Row className="mb-2">
        <Col className="d-flex justify-content-end gap-2 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              className="btn btn-sm btn-warning"
              disabled={printErrorCount === 0}
              onClick={handleAdminRetryErrors}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              {`Retry lỗi in nhãn (${printErrorCount})`}
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-danger"
            disabled={selectedIds.length === 0}
            onClick={handleDeleteSelected}
          >
            <i className="bi bi-trash me-1" />
            {`Xóa (${selectedIds.length})`}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-success"
            disabled={selectedIds.length === 0}
            onClick={handleExportExcel}
          >
            <i className="bi bi-file-earmark-excel me-1" />
            {`Export Excel (${selectedIds.length})`}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={selectedIds.length === 0}
            onClick={handleDownloadSelected}
          >
            {`Download (${selectedIds.length}) labels`}
          </button>
        </Col>
      </Row>

      <Modal
        show={showDownloadModal}
        onHide={() => setShowDownloadModal(false)}
        centered
        size="lg"
        aria-labelledby="download-labels-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="download-labels-modal">Tùy chọn tải nhãn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn muốn tải nhãn cho <strong>{selectedIds.length}</strong> đơn theo kiểu nào?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={() => {
              setShowDownloadModal(false);
              void downloadSelected(false);
            }}
          >
            Xuất lẻ (ZIP)
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowDownloadModal(false);
              void downloadSelected(true);
            }}
          >
            Xuất merge (1 PDF)
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Table className="tablet-packet" bordered striped responsive>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <Form.Check type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
              </th>
              {EtowerTableColumns.map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && handleSortColumn(field)}
                  style={{ cursor: field ? 'pointer' : 'default' }}
                >
                  {label}
                  {sortField === field &&
                    (isDesc ? (
                      <i className="bi bi-arrow-down"></i>
                    ) : (
                      <i className="bi bi-arrow-up"></i>
                    ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.length === 0 ? (
              <tr>
                <td colSpan={EtowerTableColumns.length + 1} className="text-center">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              labels.map((label) => (
                <tr key={label.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.includes(label.id)}
                      onChange={() => toggleSelect(label.id)}
                    />
                  </td>
                  <td>{label.id}</td>
                  <td>{moment(label.datetime).format('DD/MM/YYYY HH:mm')}</td>
                  <td>{label.orderId}</td>
                  <td>{label.referenceNo}</td>
                  <td>{label.trackingNo || 'N/A'}</td>
                  <td>{label.state}</td>
                  <td>{label.postcode}</td>
                  <td>{label.status}</td>
                  <td>
                    {label.labelUrl ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={() =>
                          window.open(label.labelUrl as string, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <span>View label</span>
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Row>
      <TablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </React.Fragment>
  );
};

export default EtowerTable;
