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
    filters: {
      dateFrom?: string;
      dateTo?: string;
      referenceNo?: string;
      trackingNo?: string;
    } = {},
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
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        referenceNo: filters.referenceNo || undefined,
        trackingNo: filters.trackingNo || undefined,
        sortField,
        isDesc,
      },
    });
  };

  const downloadLabelsZip = (ids: number[], merged: boolean) => {
    const token = localStorage.getItem('token');

    return axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/api/etower-labels/download-zip`,
      { ids, merged },
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

  const exportExcel = (orderIds: string[]) => {
    const token = localStorage.getItem('token');

    return axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/api/etower-labels/export-excel`,
      { orderIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );
  };

  const deleteOrders = (orderIds: string[]) => {
    const token = localStorage.getItem('token');

    return axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/api/etower-labels/delete-orders`,
      { orderIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  return {
    importLabels,
    getLabels,
    downloadLabel,
    downloadLabelsZip,
    exportExcel,
    deleteOrders,
  };
};

export default etowerLabelsService;
