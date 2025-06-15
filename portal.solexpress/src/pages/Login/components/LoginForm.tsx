import { useState } from 'react';
import { Button, Col, Form, Image, InputGroup } from 'react-bootstrap';

const LoginForm = () => {
  const [validated, setValidated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      return;
    }
    console.log(123);
    setValidated(true);
  };

  return (
    <Col
      sm={12}
      lg={6}
      className="d-flex flex-column justify-content-center bg-light bg-gradient p-5 gap-3"
    >
      <Image
        src="https://solexpress.skytrack.top/view/logo1.png"
        width={'auto'}
        height={100}
        rounded
        className="d-flex d-lg-none"
      />
      <div className="fs-6 text-center">Nhập thông tin tài khoản để đăng nhập.</div>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className="d-flex flex-column gap-3"
      >
        <Form.Group>
          <Form.Label>Tài khoản</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-person-circle"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Nhập tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group>
          <Form.Label>Mật khẩu</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-key-fill"></i>
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group>
          <Form.Check
            required
            name="terms"
            label="Tuân thủ Điều Khoản Sử Dụng Dịch Vụ của SOL EXPRESS!"
            feedbackType="invalid"
            feedbackTooltip
          />
        </Form.Group>
        <Button type="submit">Đăng nhập</Button>
      </Form>
    </Col>
  );
};
export default LoginForm;
