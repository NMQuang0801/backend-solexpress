const csv = require('csv-parser');
const axios = require('axios');
const stream = require('stream');
const sqlService = require('../config/db');
const ApiResponse = require('../utils/response');
const { LablesResponse } = require('../models/response/labelsResponse');
const { API_LABELS_CONFIG, ERROR_MESSAGES } = require('../config/api-labels');
const { GetLabelsRequest } = require('../models/request/labelsRequest');

//#region private
function buildBoxItem(line, boxNumber = 1) {
  return JSON.stringify({
    BoxNumber: String(boxNumber),
    Length: parseFloat(line.length),
    Width: parseFloat(line.width),
    Height: parseFloat(line.height),
    BoxWeight: parseFloat(line.weight),
    ChildDetails: [{ Sku: 'test', Quantity: 1 }]
  });
}

function buildJsonPayload(line, orderItemsStr) {
  const childOrders = JSON.parse(`[${orderItemsStr}]`);
  return [{
    OrderNumber: line.referenceNo,
    ShippingMethodCode: line.serviceType,
    TrackingNumber: line.referenceNo,
    Length: parseFloat(line.length),
    Width: parseFloat(line.width),
    Height: parseFloat(line.height),
    PackageNumber: 1,
    Weight: parseFloat(line.weight),
    ApplicationType: 1,
    ShippingInfo: {
      CountryCode: line.country,
      ShippingFirstName: line.recipientName,
      ShippingAddress: line.addressLine1,
      ShippingAddress1: line.addressLine2,
      ShippingCity: line.city,
      ShippingState: line.state,
      ShippingZip: line.postcode,
      ShippingPhone: line.phone
    },
    SenderInfo: {
      CountryCode: "US",
      SenderFirstName: "GPE",
      SenderCompany: "GPE Logistics",
      SenderAddress: "HCM,VN",
      SenderCity: "HCM",
      SenderState: "HCM",
      SenderZip: "700000",
      SenderPhone: "13000001111"
    },
    ChildOrders: childOrders,
    ApplicationInfos: [{
      Sku: "test21000",
      ApplicationName: line.description,
      PickingName: line.description,
      HsCode: 120000,
      Qty: 1,
      UnitPrice: parseFloat(line.unitValue),
      UnitWeight: 1.222,
      CurrencyCode: "USD",
      InvoiceRemarke: "1221"
    }]
  }];
}

// Process single order
async function processOrder(line, orderItems, userId) {
  const jsonPayload = buildJsonPayload(line, orderItems);

  try {
    const response = await axios.post(API_LABELS_CONFIG.url, jsonPayload, {
      headers: {
        Authorization: API_LABELS_CONFIG.auth,
        ...API_LABELS_CONFIG.headers
      }
    });

    return await handleApiResponse(response, line, userId);
  } catch (err) {
    console.error('API Error for order', line.referenceNo, ':', err.message);
    return { success: false, error: err.message };
  }
}

// Handle API response
async function handleApiResponse(response, line, userId) {
  const { data } = response;

  if (!data) {
    return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
  }

  // Success case
  if (data.ResultCode === 0 || data.ResultDesc === ERROR_MESSAGES.SUCCESS_CN) {
    return await handleSuccessResponse(data, line, userId);
  }

  // Failure case
  if (data.ResultCode === 1001 || data.ResultDesc === ERROR_MESSAGES.FAILURE_CN) {
    return handleFailureResponse(data, line);
  }

  return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
}

// Handle successful API response
async function handleSuccessResponse(data, line, userId) {
  const result = data.item;
  if (!result?.length || !result[0]) {
    return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
  }

  const item = result[0];
  const status = data.ResultDesc?.replaceAll(ERROR_MESSAGES.SUCCESS_CN, ERROR_MESSAGES.SUCCESS_VI) ?? ERROR_MESSAGES.SUCCESS_VI;

  await sqlService.query(
    'INSERT INTO ksn_label (OrderId, LabelUrl, Datetime, ReferenceNo, State, Postcode, ServiceCode, Status, UserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      item.OrderId,
      item.LabelUrls[0].LabelUrl,
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      line.referenceNo,
      line.state,
      line.postcode,
      line.serviceType,
      status,
      userId
    ]
  );

  return { success: true };
}

// Handle failed API response
function handleFailureResponse(data, line) {
  const result = data.item;
  if (!result?.length || !result[0]) {
    return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
  }

  const item = result[0];
  const errorMessage = item?.Feedback?.replaceAll(ERROR_MESSAGES.DUPLICATE_ORDER, ERROR_MESSAGES.DUPLICATE_ORDER_VI) ?? ERROR_MESSAGES.DEFAULT_ERROR;

  return { success: false, error: errorMessage };
}

// Process CSV data
async function processCsvData(results, userId) {
  const errors = [];
  let countOfCases = 0;
  let orderItems = '';

  for (const line of results) {
    if (line['serviceType'] && line['recipientName']) {
      currentRef = line['referenceNo'];
      orderItems = buildBoxItem(line);
    }
    else if (!line['serviceType'] && !line['recipientName']) {
      countOfCases++;
      orderItems += ',' + buildBoxItem(line, countOfCases);
    }

    countOfCases++;

    // Process order when all items are collected
    if (countOfCases === parseInt(line['itemCount'])) {
      const result = await processOrder(line, orderItems, userId);

      if (!result.success) {
        errors.push(result.error);
      }

      countOfCases = 0;
      orderItems = '';
    }
  }

  return { errors };
}
//#endregion

const importLabels = async (req, res) => {
  // Validate file
  if (!req.file || req.file.mimetype !== 'text/csv') {
    return res.json(ApiResponse.badRequest('File không đúng. Vui lòng upload file CSV.'));
  }

  const userId = req.user.username;
  const results = [];

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const { errors } = await processCsvData(results, userId);

          if (errors.length > 0) {
            const errorMessage = errors.join('. ');
            res.json(ApiResponse.badRequest(errorMessage));
          } else {
            res.json(ApiResponse.success(results, 'Thành công.'));
          }
        } catch (error) {
          console.error('Processing error:', error);
          res.json(ApiResponse.badRequest('Có lỗi xảy ra khi xử lý dữ liệu'));
        }
      })
      .on('error', (err) => {
        console.error('CSV parsing error:', err);
        res.json(ApiResponse.badRequest('Upload CSV không thành công'));
      });
  } catch (error) {
    console.error('General error:', error);
    return res.json(ApiResponse.badRequest(error));
  }
};

const getLabels = async (req, res) => {
  try {
    const { textSearch, pageIndex, pageSize, sortField, isDesc } = new GetLabelsRequest(req.query);
    if (!pageIndex || pageIndex < 1) {
      return res.json(ApiResponse.error('PageIndex không đúng.'));
    }

    if (!pageSize || pageSize < 1) {
      return res.json(ApiResponse.error('PageSize không đúng.'));
    }

    const queryParams = [];
    let querySearch = '';

    if (textSearch && textSearch.trim() !== '') {
      const escapedSearch = textSearch.trim().replace(/%/g, '\\%').replace(/_/g, '\\_');;
      const likeValue = `%${escapedSearch}%`;
      querySearch = `AND ( OrderId LIKE ? OR ReferenceNo LIKE ? OR State LIKE ? OR  Postcode LIKE ?)`;
      queryParams.push(likeValue, likeValue, likeValue, likeValue);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM ksn_label WHERE OrderId <> '' ${querySearch} `;
    const [countRows] = await sqlService.query(countQuery, queryParams);
    const total = countRows[0]?.total || 0;

    const dataQuery = `SELECT * FROM ksn_label WHERE OrderId <> '' ${querySearch} ORDER BY ${sortField} ${isDesc ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`;
    const limit = parseInt(pageSize);
    const offset = (parseInt(pageIndex) - 1) * limit;
    queryParams.push(limit, offset);

    const [data] = await sqlService.query(dataQuery, queryParams);

    const response = new LablesResponse(total, data, limit, parseInt(pageIndex));
    res.json(ApiResponse.success(response, 'Successful'));
  } catch (err) {
    console.error('Có lỗi xảy ra:', err);
    res.status(500).json(ApiResponse.error('Internal Server Error'));
  }
};

module.exports = { importLabels, getLabels };