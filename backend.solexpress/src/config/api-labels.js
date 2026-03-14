// API configuration
const API_LABELS_CONFIG = {
  url: process.env.URL_LABELS,
  auth: 'Basic ' + Buffer.from(process.env.KEY_API_LABELS).toString('base64'),
  headers: {
    'Content-Type': 'application/json'
  }
};

// Error message mappings
const LABEL_MESSAGES = {
  DUPLICATE_ORDER: '客户单号重复',
  DUPLICATE_ORDER_VI: 'Số đơn hàng của khách hàng được lặp lại',
  SUCCESS_CN: '成功',
  SUCCESS_VI: 'Thành công',
  SUCCESS_EN: 'Success',
  FAILURE_CN: '失败',
  DEFAULT_ERROR: 'Có lỗi xảy ra'
};


module.exports = { API_LABELS_CONFIG, LABEL_MESSAGES };