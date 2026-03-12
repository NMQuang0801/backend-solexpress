import axiosInstance from './axiosInstance';

const etowerLabelsService = () => {
  const importLabels = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    return axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/api/etower-labels/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000,
      }
    );
  };

  const getLabels = (
    pageIndex: number = 1,
    pageSize: number = 20,
    textSearch: string = '',
    sortField = 'Id',
    isDesc = true
  ) => {
    const token = localStorage.getItem('token');

    return axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/etower-labels`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        pageIndex,
        pageSize,
        textSearch,
        sortField,
        isDesc,
      },
    });
  };

  const downloadLabelsZip = (ids: number[]) => {
    const token = localStorage.getItem('token');

    return axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/api/etower-labels/download-zip`,
      { ids },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );
  };

  const downloadLabel = (id: number) => {
    const token = localStorage.getItem('token');

    return axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/etower-labels/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });
  };

  return {
    importLabels,
    getLabels,
    downloadLabel,
    downloadLabelsZip,
  };
};

export default etowerLabelsService;
