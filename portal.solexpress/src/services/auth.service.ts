import { ILoginRequest } from '@/types/request';
import axios from 'axios';

const authService = () => {
  const login = (request: ILoginRequest) => {
    return axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, request);
  };

  return {
    login,
  };
};

export default authService;
