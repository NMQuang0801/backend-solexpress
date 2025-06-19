import axiosInstance from './axiosInstance';

const labelsService = () => {
  const importLabels = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    return axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/labels/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const getLabels = (pageIndex: number = 1, pageSize: number = 20, textSearch: string = '') => {
    const token = localStorage.getItem('token');

    return axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/labels`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        pageIndex,
        pageSize,
        textSearch,
      },
    });
  };

  return {
    importLabels,
    getLabels,
  };
};

export default labelsService;
