import { labelsService } from '@/services';
import { useLoading, useAlert } from '@/contexts';
import { useTableSelection, useTableSort } from '@/hooks';
import { getErrorMessages } from '@/types/response';
import { TablePagination } from '@/components';
import { Label, LabelsResponse } from '@/types/label';
import moment from 'moment';
import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { CirroTableColumns } from '../types';

type CirroTableProps = {
  isImported: boolean;
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
};

const CirroTable = ({ isImported, setIsImported }: CirroTableProps) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [textSearch, setTextSearch] = useState('');
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const { sortField, isDesc, handleSort, resetSort } = useTableSort();
  const { selectedIds, isAllSelected, toggleSelect, toggleSelectAll, clearSelection } =
    useTableSelection(labels);
  const { showLoading, hideLoading } = useLoading();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (isImported) {
      resetSort();
      setPageIndex(1);
      setPageSize(20);
      setTextSearch('');
      fetchLabels();
      setIsImported(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImported]);

  useEffect(() => {
    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, sortField, isDesc]);

  const fetchLabels = async (search = textSearch, page = pageIndex) => {
    setLoading(true);
    try {
      const service = labelsService();
      const response = await service.getLabels(page, pageSize, search, sortField, isDesc);
      const data: LabelsResponse = response.data.data;
      setLabels(data.data || []);
      setTotal(data.total || 0);
      clearSelection();
    } catch (err) {
      console.error('Error fetching cirro labels:', err);
      showAlert('error', getErrorMessages(err, 'Có lỗi xảy ra khi tải danh sách labels'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setTextSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPageIndex(1);
      fetchLabels(value, 1);
    }, 500);
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

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) return;

    showLoading();
    try {
      const service = labelsService();
      const response = await service.downloadLabelsZip(selectedIds);
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cirro-labels-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert('success', 'Download labels thành công!');
    } catch (error) {
      console.error('Error downloading labels zip:', error);
      showAlert('error', getErrorMessages(error, 'Có lỗi xảy ra khi download labels'));
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
      <Row className="search-label">
        <Form.Control
          type="text"
          placeholder="Nhập từ khóa hoặc ký tự..."
          value={textSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Row>
      <Row className="mb-2">
        <Col className="d-flex justify-content-end gap-2">
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
      <Row>
        <Table className="tablet-packet" bordered striped responsive>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <Form.Check type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
              </th>
              {CirroTableColumns.map(({ label, field }) => (
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
                <td colSpan={CirroTableColumns.length + 1} className="text-center">
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
                  <td>{label.state}</td>
                  <td>{label.postcode}</td>
                  <td>{label.referenceNo}</td>
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

export default CirroTable;
