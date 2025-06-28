import { labelsService } from '@/services';
import moment from 'moment';
import React, { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Form, Pagination, Row, Spinner, Table } from 'react-bootstrap';
import { Label, LabelsResponse, LabelTableColumns } from '../types';

const LabelTable = ({
  isImported,
  setIsImported,
}: {
  isImported: boolean;
  setIsImported: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [textSearch, setTextSearch] = useState('');
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isDesc, setIsDesc] = useState(true);
  const [sortField, setSortField] = useState('Id');

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
      const service = labelsService();
      const response = await service.getLabels(page, pageSize, search, field, desc);
      const data: LabelsResponse = response.data.data;
      setLabels(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching labels:', err);
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
      <Row>
        <Table className="tablet-packet" bordered striped responsive>
          <thead>
            <tr>
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
                  <td>{label.id}</td>
                  <td>{moment(label.datetime).format('DD/MM/YYYY HH:mm')}</td>
                  <td>{label.orderId}</td>
                  <td>{label.state}</td>
                  <td>{label.postcode}</td>
                  <td>{label.referenceNo}</td>
                  <td>{label.status}</td>
                  <td>
                    {label.labelUrl ? (
                      <div className="d-flex gap-2">
                        <i className="bi bi-download"></i>
                        <a
                          className="text-black"
                          href={label.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download label
                        </a>
                      </div>
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
