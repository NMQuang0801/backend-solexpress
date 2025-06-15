// import moment from 'moment';
import { Form, Pagination, Table } from 'react-bootstrap';
import { FilterPacket } from './components';
import './Packet.scss';

const Packet = () => {
  return (
    <div className="packet_container">
      <FilterPacket />
      <Table className="tablet-packet" bordered striped responsive>
        <thead>
          <tr>
            <th></th>
            <th>TP Code</th>
            <th>Hawb Code</th>
            <th>Date</th>
            <th>Service</th>
            <th>Receiver</th>
            <th>Address</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td>921888301</td>
            <td>
              <div className="d-flex flex-column">
                <span className="text-nowrap">
                  9218883011 - <strong>21kg</strong>
                </span>
                <span className="text-nowrap">
                  {' '}
                  9218883012 - <strong>17kg</strong>
                </span>
                <span className="text-nowrap">
                  9218883013 - <strong>24kg</strong>
                </span>
              </div>
            </td>
            {/* <td>{moment('2024-12-12').format('DD/MM/YYYY')}</td> */}
            <td>
              <span>RG - AU</span>
            </td>
            <td>
              <span>CHAU TO</span>
            </td>
            <td>@mdo</td>
            <td>
              <span>SOL EXPRESS</span>
            </td>
            <td>
              <div className="d-flex flex-column">
                <span className="text-nowrap">Exported</span>
                <span className="text-nowrap">Đã thanh toán</span>
                <span className="text-nowrap">Đã làm chứng từ</span>
              </div>
            </td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </Table>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Hiện
          <Form.Select aria-label="Default select example">
            <option selected>20</option>
            <option value="0">40</option>
            <option value="1">60</option>
            <option value="2">80</option>
          </Form.Select>
          dòng
        </div>
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
      </div>
    </div>
  );
};

export default Packet;
