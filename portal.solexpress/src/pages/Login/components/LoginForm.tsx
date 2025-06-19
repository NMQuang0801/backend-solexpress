import { authService } from '@/services';
import { ILoginResponse } from '@/types/response/userResponse';
import { AxiosError } from 'axios';
import * as formik from 'formik';
import { useState } from 'react';
import { Button, Col, Form, Image, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import TermsModal from './TermsModal';

const LoginForm = () => {
  const { Formik } = formik;
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
    terms: yup.bool().required().oneOf([true], 'Bạn có tuân thủ điều khoản không !!!'),
  });

  const onSubmit = async ({ username, password }: { username: string; password: string }) => {
    try {
      const request = { username, password };
      authService()
        .login(request)
        .then((res) => {
          if (res.data.success) {
            const response: ILoginResponse = res.data.data;
            // Store token and user info in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            // Redirect to home page
            navigate('/');
          } else {
            alert(res.data.message);
          }
        })
        .catch((err: AxiosError) => {
          alert(err);
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Col
      sm={12}
      lg={6}
      className="d-flex flex-column justify-content-center align-items-center bg-light bg-gradient p-5 gap-3"
    >
      <Image
        src="https://solexpress.skytrack.top/view/logo1.png"
        width={'auto'}
        height={100}
        rounded
        className="d-flex d-lg-none"
      />
      <div className="fs-6 text-center">Nhập thông tin tài khoản để đăng nhập.</div>
      <Formik
        validationSchema={schema}
        onSubmit={onSubmit}
        initialValues={{
          username: '',
          password: '',
          terms: false,
        }}
      >
        {({ handleSubmit, handleChange, values, errors }) => (
          <Form noValidate onSubmit={handleSubmit} className="login-form">
            <Form.Group controlId="validationFormUsername" className="mb-3 position-relative">
              <Form.Label>Tài khoản</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <i className="bi bi-person-circle"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Nhập tài khoản"
                  aria-describedby="inputGroupPrepend"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {'Vui lòng nhập tài khoản !!!'}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="validationFormPassword" className="mb-3 position-relative">
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <i className="bi bi-key-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  aria-describedby="inputGroupPrepend"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {'Vui lòng nhập mật khẩu !!!'}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3 position-relative d-flex gap-2">
              <Form.Check
                required
                name="terms"
                onChange={handleChange}
                isInvalid={!!errors.terms}
                feedback={errors.terms}
                feedbackType="invalid"
                id="validationFormTerms"
              ></Form.Check>
              <Form.Check.Label onClick={() => setShowModal(true)}>
                Tuân thủ Điều Khoản Sử Dụng Dịch Vụ của SOL EXPRESS!
              </Form.Check.Label>
            </Form.Group>
            <Button type="submit">Submit form</Button>
          </Form>
        )}
      </Formik>
      <TermsModal showModal={showModal} setShowModal={setShowModal} />
    </Col>
  );
};
export default LoginForm;
