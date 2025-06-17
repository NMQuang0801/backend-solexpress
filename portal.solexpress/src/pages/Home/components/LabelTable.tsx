import React from 'react';
import { Col, Form, Pagination, Row, Table } from 'react-bootstrap';

const LabelTable = () => {
  return (
    <React.Fragment>
      <Row>
        <Table className="tablet-packet" bordered striped responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>ID Label</th>
              <th>State</th>
              <th>Post Code</th>
              <th>Reference Code</th>
              <th>Status</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
            <tr>
              <td>1</td>
              <td> 2025-04-16 13:38:53</td>
              <td>00593529783684949564</td>
              <td>WA</td>
              <td>6064</td>
              <td>2299445568</td>
              <td>成功</td>
              <td>Download label</td>
            </tr>
          </tbody>
        </Table>
      </Row>
      <Row className="d-flex justify-content-between">
        <Col xs={2} className="d-flex align-items-center gap-2">
          Hiện
          <Form.Select aria-label="Default select example">
            <option selected>20</option>
            <option value="0">40</option>
            <option value="1">60</option>
            <option value="2">80</option>
          </Form.Select>
          dòng
        </Col>
        <Col xs={10} className="d-flex justify-content-end">
          <Pagination>
            <Pagination.First />
            <Pagination.Prev />
            <Pagination.Item>{1}</Pagination.Item>
            <Pagination.Ellipsis />

            <Pagination.Item>{10}</Pagination.Item>
            <Pagination.Item>{11}</Pagination.Item>
            <Pagination.Item active>{12}</Pagination.Item>
            <Pagination.Item>{13}</Pagination.Item>
            <Pagination.Item disabled>{14}</Pagination.Item>

            <Pagination.Ellipsis />
            <Pagination.Item>{20}</Pagination.Item>
            <Pagination.Next />
            <Pagination.Last />
          </Pagination>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default LabelTable;
