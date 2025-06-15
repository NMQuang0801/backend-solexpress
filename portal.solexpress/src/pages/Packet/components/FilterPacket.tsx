import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
// import Datetime from 'react-datetime';
// import 'react-datetime/css/react-datetime.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const FilterPacket = () => {
  const [searchBy] = useState();
  const [searchValue] = useState();
  // const [dateTime, setDateTime] = useState(new Date());

  // const handleSelectSearchBy = (e) => {
  //   setSearchBy(e);
  // };

  // const handleChangeSearch = (e) => {
  //   console.log(e);
  // };

  const handleSubmitSearch = () => {
    console.log(searchBy, searchValue);
  };

  return (
    <div className="filter_packet_container">
      <div className="filter_search">
        <Form.Select className="search-by" aria-label="Default select example">
          <option value="0">Tất cả</option>
          <option value="1">Đã làm chứng từ</option>
          <option value="2">Chưa làm chứng từ</option>
        </Form.Select>
        <InputGroup>
          {/* <Form.Control placeholder="Search..." value={searchValue} onChange={handleChangeSearch} /> */}
          <Button className="btn-search" variant="warning" onClick={handleSubmitSearch}>
            <i className="bi bi-search"></i>
          </Button>
        </InputGroup>
      </div>
      <div className="filter_packet">
        {/* <div>
          <label className="form-label">Từ ngày</label>
          <Datetime value={dateTime} onChange={(date) => setDateTime(date)} timeFormat={false} />
        </div>
        <div>
          <label className="form-label">Đến ngày</label>
          <Datetime value={dateTime} onChange={(date) => setDateTime(date)} timeFormat={false} />
        </div> */}
        <div>
          <label className="form-label">Chứng từ</label>
          <Form.Select aria-label="Default select example">
            <option value="0">Tất cả</option>
            <option value="1">Đã làm chứng từ</option>
            <option value="2">Chưa làm chứng từ</option>
          </Form.Select>
        </div>
        <div>
          <label className="form-label">Trạng thái</label>
          <Form.Select aria-label="Default select example">
            <option>Tất cả</option>
            <option value="0">Created</option>
            <option value="1">Imported</option>
            <option value="2">Export</option>
          </Form.Select>
        </div>
        <div>
          <label className="form-label">Thanh toán</label>
          <Form.Select aria-label="Default select example">
            <option>Tất cả</option>
            <option value="0">Tất cả</option>
            <option value="1">Chưa thanh toán</option>
            <option value="2">Đã thanh toán</option>
          </Form.Select>
        </div>
        <div>
          <Button variant="secondary">Clear</Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPacket;
