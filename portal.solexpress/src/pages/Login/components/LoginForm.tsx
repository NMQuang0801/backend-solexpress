import * as formik from 'formik';
import { Button, Col, Form, Image, InputGroup } from 'react-bootstrap';
import * as yup from 'yup';

const LoginForm = () => {
  const { Formik } = formik;

  const schema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
    terms: yup.bool().required().oneOf([true], 'terms must be accepted'),
  });

  // const [validated, setValidated] = useState(false);
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');

  // const handleSubmit = (event: any) => {
  //   event.preventDefault();
  //   const form = event.currentTarget;
  //   if (form.checkValidity() === false) {
  //     return;
  //   }
  //   console.log(123);
  //   setValidated(true);
  // };

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
        onSubmit={(e) => console.log(e)}
        initialValues={{
          username: '',
          password: '',
          terms: false,
        }}
      >
        {({ handleSubmit, handleChange, values, errors }) => (
          <Form noValidate onSubmit={handleSubmit} className="d-flex flex-column">
            <Form.Group controlId="validationFormik101" className="mb-3 position-relative">
              <Form.Label>Tài khoản</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-person-circle"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Nhập tài khoản"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid" tooltip>
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="validationFormik102" className="mb-3 position-relative">
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-key-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid" tooltip>
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-5 position-relative">
              <Form.Check
                required
                name="terms"
                label="Tuân thủ Điều Khoản Sử Dụng Dịch Vụ của SOL EXPRESS!"
                onChange={handleChange}
                isInvalid={!!errors.terms}
                feedback={errors.terms}
                feedbackType="invalid"
                id="validationFormik103"
                feedbackTooltip
              />
            </Form.Group>
            <Button type="submit">Submit form</Button>
          </Form>
        )}
      </Formik>
    </Col>
  );
};
export default LoginForm;
