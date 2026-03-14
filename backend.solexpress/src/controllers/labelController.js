const csv = require('csv-parser');
const axios = require('axios');
const JSZip = require('jszip');
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

async function processOrder(line, orderItems, userId) {
  const jsonPayload = buildJsonPayload(line, orderItems);

  try {
    const response = await axios.post(API_LABELS_CONFIG.url, jsonPayload, {
      headers: {
        Authorization: API_LABELS_CONFIG.auth,
        ...API_LABELS_CONFIG.headers
      }
    });
    return handleApiResponse(response, line, userId);
  } catch (err) {
    console.error('API Error for order', line.referenceNo, ':', err.message);
    return { success: false, error: err.message };
  }
}

async function handleApiResponse(response, line, userId) {
  const { data } = response;

  if (!data) {
    return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
  }

  if (data.ResultCode === 0 || data.ResultDesc === ERROR_MESSAGES.SUCCESS_CN) {
    return handleSuccessResponse(data, line, userId);
  }

  if (data.ResultCode === 1001 || data.ResultDesc === ERROR_MESSAGES.FAILURE_CN) {
    return handleFailureResponse(data, line);
  }

  return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
}

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
      new Date(),
      line.referenceNo ?? '',
      line.state ?? '',
      line.postcode ?? '',
      line.serviceType ?? '',
      status,
      userId
    ]
  );

  return { success: true };
}

function handleFailureResponse(data, line) {
  const result = data.item;
  if (!result?.length || !result[0]) {
    return { success: false, error: ERROR_MESSAGES.DEFAULT_ERROR };
  }

  const item = result[0];
  const errorMessage = item?.Feedback?.replaceAll(ERROR_MESSAGES.DUPLICATE_ORDER, ERROR_MESSAGES.DUPLICATE_ORDER_VI) ?? ERROR_MESSAGES.DEFAULT_ERROR;
  return { success: false, error: errorMessage };
}

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function processCsvData(results, userId) {
  const errors = [];
  let countOfCases = 0;
  let orderItems = '';

  for (const line of results) {
    if (line['serviceType'] && line['recipientName']) {
      orderItems = buildBoxItem(line);
    } else if (!line['serviceType'] && !line['recipientName']) {
      countOfCases++;
      orderItems += ',' + buildBoxItem(line, countOfCases);
    }

    countOfCases++;

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
  if (!req.file || req.file.mimetype !== 'text/csv') {
    return ApiResponse.badRequest(res, 'File không đúng. Vui lòng upload file CSV.');
  }

  const userId = req.user.username;

  try {
    const results = await parseCsvBuffer(req.file.buffer);
    const { errors } = await processCsvData(results, userId);

    if (errors.length > 0) {
      return ApiResponse.badRequest(res, errors.join('. '));
    }

    return ApiResponse.success(res, results, 'Thành công.');
  } catch (error) {
    console.error('Import labels error:', error);
    return ApiResponse.serverError(res, 'Có lỗi xảy ra khi xử lý dữ liệu.');
  }
};

const getLabels = async (req, res) => {
  try {
    const { textSearch, pageIndex, pageSize, sortField, isDesc } = new GetLabelsRequest(req.query);

    if (!pageIndex || pageIndex < 1) {
      return ApiResponse.validationError(res, 'PageIndex không đúng.');
    }

    if (!pageSize || pageSize < 1) {
      return ApiResponse.validationError(res, 'PageSize không đúng.');
    }

    const searchParams = [];
    let querySearch = '';

    if (textSearch && textSearch.trim() !== '') {
      const escaped = textSearch.trim().replace(/%/g, '\\%').replace(/_/g, '\\_');
      const like = `%${escaped}%`;
      querySearch = 'AND (OrderId LIKE ? OR ReferenceNo LIKE ? OR State LIKE ? OR Postcode LIKE ?)';
      searchParams.push(like, like, like, like);
    }

    const baseWhere = `FROM ksn_label WHERE OrderId <> '' ${querySearch}`;

    const allowedSortFields = ['Id', 'OrderId', 'ReferenceNo', 'Datetime', 'State', 'Postcode', 'ServiceCode', 'Status'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'Id';
    const direction = isDesc ? 'DESC' : 'ASC';

    const limit = parseInt(pageSize);
    const offset = (parseInt(pageIndex) - 1) * limit;

    const [countRows, dataRows] = await Promise.all([
      sqlService.query(`SELECT COUNT(*) AS total ${baseWhere}`, searchParams),
      sqlService.query(
        `SELECT * ${baseWhere} ORDER BY ${safeSortField} ${direction} LIMIT ? OFFSET ?`,
        [...searchParams, limit, offset]
      ),
    ]);

    const total = countRows[0][0]?.total || 0;
    const data = dataRows[0];

    return ApiResponse.success(res, new LablesResponse(total, data, limit, parseInt(pageIndex)));
  } catch (err) {
    console.error('Get labels error:', err);
    return ApiResponse.serverError(res);
  }
};

const downloadLabelsZip = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || !ids.length) {
      return ApiResponse.badRequest(res, 'Danh sách Id không hợp lệ.');
    }

    const [rows] = await sqlService.query(
      `SELECT Id, OrderId, LabelUrl FROM ksn_label WHERE Id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    if (!rows?.length) {
      return ApiResponse.notFound(res, 'Không tìm thấy label nào tương ứng.');
    }

    const zip = new JSZip();

    const fetchResults = await Promise.allSettled(
      rows
        .filter((label) => label.LabelUrl || label.labelUrl)
        .map(async (label) => {
          const url = label.LabelUrl || label.labelUrl;
          const response = await axios.get(url, { responseType: 'arraybuffer' });
          return {
            fileName: `label-${label.OrderId || label.orderId || label.Id}.pdf`,
            data: response.data,
          };
        })
    );

    for (const result of fetchResults) {
      if (result.status === 'fulfilled') {
        zip.file(result.value.fileName, result.value.data);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="labels-au.zip"');
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Download labels zip error:', err);
    return ApiResponse.serverError(res, 'Có lỗi xảy ra khi tải zip label.');
  }
};

module.exports = { importLabels, getLabels, downloadLabelsZip };
