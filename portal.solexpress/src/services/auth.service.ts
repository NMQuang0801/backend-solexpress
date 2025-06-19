import { ILoginRequest } from '@/types/request';
import axiosInstance from './axiosInstance';

const authService = () => {
  const login = (request: ILoginRequest) => {
    return axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/users/login`, request);
  };

  const verifyToken = () => {
    const token = localStorage.getItem('token');
    return axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/check-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return {
    login,
    verifyToken,
  };
};

export default authService;
