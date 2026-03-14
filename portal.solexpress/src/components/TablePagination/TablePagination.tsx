import { useMemo } from 'react';
import { Col, Form, Pagination, Row } from 'react-bootstrap';

type TablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const PAGE_SIZE_OPTIONS = [20, 40, 60, 80];
const MAX_VISIBLE_PAGES = 5;

const TablePagination = ({
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) => {
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(parseInt(event.target.value));
  };

  const renderPaginationItems = () => {
    const items = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Pagination.Item key={i} active={i === pageIndex} onClick={() => onPageChange(i)}>
            {i}
          </Pagination.Item>
        );
      }
    } else if (pageIndex <= 3) {
      for (let i = 1; i <= 4; i++) {
        items.push(
          <Pagination.Item key={i} active={i === pageIndex} onClick={() => onPageChange(i)}>
            {i}
          </Pagination.Item>
        );
      }
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    } else if (pageIndex >= totalPages - 2) {
      items.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </Pagination.Item>
      );
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
      for (let i = totalPages - 3; i <= totalPages; i++) {
        items.push(
          <Pagination.Item key={i} active={i === pageIndex} onClick={() => onPageChange(i)}>
            {i}
          </Pagination.Item>
        );
      }
    } else {
      items.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </Pagination.Item>
      );
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
      for (let i = pageIndex - 1; i <= pageIndex + 1; i++) {
        items.push(
          <Pagination.Item key={i} active={i === pageIndex} onClick={() => onPageChange(i)}>
            {i}
          </Pagination.Item>
        );
      }
      items.push(<Pagination.Ellipsis key="ellipsis2" />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  if (total === 0) return null;

  return (
    <Row className="create-label-pagination d-flex justify-content-between flex-column flex-lg-row gap-1 align-items-center">
      <Col xs={5} xl={3} className="d-flex align-items-center gap-2">
        Hiện
        <Form.Select aria-label="Page size" value={pageSize} onChange={handlePageSizeChange}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Form.Select>
        dòng
      </Col>
      <Col xs={6} className="d-flex justify-content-center justify-content-lg-end">
        <Pagination>
          <Pagination.First onClick={() => onPageChange(1)} disabled={pageIndex === 1} />
          <Pagination.Prev onClick={() => onPageChange(pageIndex - 1)} disabled={pageIndex === 1} />
          {renderPaginationItems()}
          <Pagination.Next
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex === totalPages}
          />
          <Pagination.Last
            onClick={() => onPageChange(totalPages)}
            disabled={pageIndex === totalPages}
          />
        </Pagination>
      </Col>
    </Row>
  );
};

export default TablePagination;
