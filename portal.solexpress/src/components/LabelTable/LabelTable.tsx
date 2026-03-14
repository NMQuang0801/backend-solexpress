import { labelsService, etowerLabelsService } from '@/services';
import { useLoading, useAlert } from '@/contexts';
import { getErrorMessages } from '@/types/response';
import moment from 'moment';
import React, { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Form, Pagination, Row, Spinner, Table } from 'react-bootstrap';
import { Label, LabelsResponse, LabelTableColumns } from '@/pages/Home/types';

type LabelTableProps = {
  isImported: boolean;
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
  variant?: 'default' | 'etower';
};

const LabelTable = ({ isImported, setIsImported, variant = 'default' }: LabelTableProps) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [textSearch, setTextSearch] = useState('');
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isDesc, setIsDesc] = useState(true);
  const [sortField, setSortField] = useState('Id');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (isImported) {
      setSortField('Id');
      setIsDesc(true);
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

  const fetchLabels = async (
    search = textSearch,
    page = pageIndex,
    field = sortField,
    desc = isDesc
  ) => {
    setLoading(true);

    try {
      const service = variant === 'etower' ? etowerLabelsService() : labelsService();
      const response = await service.getLabels(page, pageSize, search, field, desc);
      const data: LabelsResponse = response.data.data;
      setLabels(data.data || []);
      setTotal(data.total || 0);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error fetching labels:', err);
      showAlert('error', getErrorMessages(err, 'Có lỗi xảy ra khi tải danh sách labels'));
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value);
    setPageSize(newPageSize);
    setPageIndex(1);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handleSearch = (value: string) => {
    setTextSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setPageIndex(1);
      fetchLabels(value, 1);
    }, 500);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setIsDesc((prev) => !prev);
    } else {
      setSortField(field);
      setIsDesc(true);
    }
    setPageIndex(1);
  };

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item key={i} active={i === pageIndex} onClick={() => handlePageChange(i)}>
            {i}
          </Pagination.Item>
        );
      }
    } else {
      if (pageIndex <= 3) {
        for (let i = 1; i <= 4; i++) {
          items.push(
            <Pagination.Item key={i} active={i === pageIndex} onClick={() => handlePageChange(i)}>
              {i}
            </Pagination.Item>
          );
        }
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
        items.push(
          <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </Pagination.Item>
        );
      } else if (pageIndex >= totalPages - 2) {
        items.push(
          <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
            1
          </Pagination.Item>
        );
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(
            <Pagination.Item key={i} active={i === pageIndex} onClick={() => handlePageChange(i)}>
              {i}
            </Pagination.Item>
          );
        }
      } else {
        items.push(
          <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
            1
          </Pagination.Item>
        );
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
        for (let i = pageIndex - 1; i <= pageIndex + 1; i++) {
          items.push(
            <Pagination.Item key={i} active={i === pageIndex} onClick={() => handlePageChange(i)}>
              {i}
            </Pagination.Item>
          );
        }
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
        items.push(
          <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </Pagination.Item>
        );
      }
    }

    return items;
  };

  const isAllSelected = useMemo(
    () => labels.length > 0 && selectedIds.length === labels.length,
    [labels, selectedIds]
  );

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(labels.map((label) => label.id));
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    showLoading();
    try {
      const service = variant === 'etower' ? etowerLabelsService() : labelsService();
      const response = await service.downloadLabelsZip(selectedIds);

      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const prefix = variant === 'etower' ? 'etower-labels' : 'labels-au';
      link.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.zip`;
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
        <Col className="d-flex justify-content-end">
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
              {LabelTableColumns.map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && handleSort(field)}
                  style={{ cursor: 'pointer' }}
                >
                  {label}
                  {sortField === field &&
                    (!isDesc ? (
                      <i className="bi bi-arrow-up"></i>
                    ) : (
                      <i className="bi bi-arrow-down"></i>
                    ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
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
      {labels.length > 0 && (
        <Row className="create-label-pagination d-flex justify-content-between flex-column flex-lg-row gap-1 align-items-center">
          <Col xs={5} xl={3} className="d-flex align-items-center gap-2">
            Hiện
            <Form.Select
              aria-label="Default select example"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={20}>20</option>
              <option value={40}>40</option>
              <option value={60}>60</option>
              <option value={80}>80</option>
            </Form.Select>
            dòng
          </Col>
          <Col xs={6} className="d-flex justify-content-center justify-content-lg-end">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={pageIndex === 1} />
              <Pagination.Prev
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 1}
              />
              {renderPaginationItems()}
              <Pagination.Next
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={pageIndex === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};

export default LabelTable;
