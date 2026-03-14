const axios = require('axios');
const xlsx = require('xlsx');
const JSZip = require('jszip');
const sqlService = require('../config/db');
const ApiResponse = require('../utils/response');
const { API_ETOWER_CONFIG } = require('../config/api-etower');
const { GetLabelsRequest } = require('../models/request/labelsRequest');
const { LablesResponse } = require('../models/response/labelsResponse');

function mapRowToEtowerOrder(row) {
  return {
    referenceNo: row.referenceNo,
    country: row.country,
    serviceCode: row.serviceCode,
    serviceOption: row.serviceOption,
    facility: row.facility,
    state: row.state,
    city: row.city,
    postcode: row.postcode,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    addressLine3: row.addressLine3,
    recipientName: row.recipientName,
    phone: row.phone,
    email: row.email,
    sku: row.sku,
    invoiceCurrency: row.invoiceCurrency,
    invoiceValue: row.invoiceValue ? Number(row.invoiceValue) : undefined,
    weightUnit: row.weightUnit || 'KG',
    weight: row.weight ? Number(row.weight) : undefined,
    description: row.description,
    nativeDescription: row.nativeDescription,
    shipperName: row.shipperName,
    shipperPhone: row.shipperPhone,
    shipperAddressLine1: row.shipperAddressLine1,
    shipperAddressLine2: row.shipperAddressLine2,
    shipperAddressLine3: row.shipperAddressLine3,
    shipperCity: row.shipperCity,
    shipperState: row.shipperState,
    shipperPostcode: row.shipperPostcode,
    shipperCountry: row.shipperCountry,
    volume: row.volume ? Number(row.volume) : undefined,
    orderItems: [
      {
        itemNo: row.itemNo || 1,
        sku: row.sku,
        description: row.description,
        nativeDescription: row.nativeDescription,
        hsCode: row.hsCode,
        originCountry: row.originCountry || row.country,
        itemCount: row.itemCount ? Number(row.itemCount) : 1,
        unitValue: row.unitValue
          ? Number(row.unitValue)
          : row.invoiceValue
          ? Number(row.invoiceValue)
          : undefined,
        warehouseNo: row.warehouseNo,
        productURL: row.productURL,
        weight: row.itemWeight ? Number(row.itemWeight) : undefined,
      },
    ],
  };
}

async function createShippingOrders(orders) {
  const path = API_ETOWER_CONFIG.createOrdersPath;
  const url = `${API_ETOWER_CONFIG.baseUrl}${path}`;
  const headers = API_ETOWER_CONFIG.buildHeaders('POST', path);
  const { data } = await axios.post(url, orders, { headers });
  return data;
}

async function printLabels(orderIds) {
  const path = API_ETOWER_CONFIG.printLabelPath;
  const url = `${API_ETOWER_CONFIG.baseUrl}${path}`;
  const body = {
    orderIds,
    masterIds: null,
    labelType: 1,
    packinglist: false,
    merged: false,
    labelFormat: null,
    dpi: null,
  };
  const headers = API_ETOWER_CONFIG.buildHeaders('POST', path);
  const { data } = await axios.post(url, body, { headers });
  return data;
}

async function queryOrders(orderIds) {
  const path = API_ETOWER_CONFIG.queryOrdersPath;
  const url = `${API_ETOWER_CONFIG.baseUrl}${path}`;
  const headers = API_ETOWER_CONFIG.buildHeaders('POST', path);
  const { data } = await axios.post(url, orderIds, { headers });
  return data;
}

async function gainLabelSpecs(orderIds) {
  const path = API_ETOWER_CONFIG.labelSpecsPath;
  const url = `${API_ETOWER_CONFIG.baseUrl}${path}`;
  const headers = API_ETOWER_CONFIG.buildHeaders('POST', path);
  const { data } = await axios.post(url, orderIds, { headers });
  return data;
}

function parseExcelWithTemplate(sheet) {
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rawRows.length || rawRows.length < 3) return null;

  const headerKeys = rawRows[1].map((cell) => (cell != null ? String(cell).trim() : ''));
  const dataRows = rawRows.slice(2);
  return dataRows
    .filter((row) => row.some((cell) => cell != null && String(cell).trim() !== ''))
    .map((row) => {
      const obj = {};
      headerKeys.forEach((key, i) => {
        if (key) obj[key] = row[i] != null ? row[i] : '';
      });
      return obj;
    });
}

function parseExcelWithFirstRowHeader(sheet) {
  return xlsx.utils.sheet_to_json(sheet);
}

async function batchInsertLabels(labelData, orderMetaById, userId) {
  const insertRows = [];

  for (const item of labelData) {
    if (item.status !== 'Success') continue;

    const key = item.orderId || item.trackingNo;
    const meta = key ? orderMetaById[key] || {} : {};

    insertRows.push([
      item.orderId || '',
      item.labelUrl || '',
      new Date(),
      meta.referenceNo || item.referenceNo || '',
      meta.state || '',
      meta.postcode || '',
      meta.serviceCode || '',
      item.status,
      userId,
    ]);
  }

  if (!insertRows.length) return;

  const placeholders = insertRows.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
  const flatValues = insertRows.flat();

  await sqlService.query(
    `INSERT INTO ksn_label_etower (OrderId, LabelUrl, Datetime, ReferenceNo, State, Postcode, ServiceCode, Status, UserId) VALUES ${placeholders}`,
    flatValues
  );
}

const importEtowerLabels = async (req, res) => {
  if (!req.file) {
    return ApiResponse.badRequest(res, 'Vui lòng upload file CSV hoặc Excel (.xlsx).');
  }

  const userId = req.user.username;

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    let rows = parseExcelWithTemplate(sheet);
    if (!rows || !rows.length) {
      rows = parseExcelWithFirstRowHeader(sheet);
      if (!rows.length) {
        return ApiResponse.badRequest(res, 'File không có dữ liệu.');
      }
    }

    const orders = rows.map(mapRowToEtowerOrder);
    const createdOrderIds = [];
    const orderMetaById = {};
    const createErrors = [];

    const chunkSize = 300;
    for (let i = 0; i < orders.length; i += chunkSize) {
      const chunk = orders.slice(i, i + chunkSize);
      const createResult = await createShippingOrders(chunk);

      if (!createResult?.data) {
        createErrors.push('Create Shipping Orders thất bại.');
        continue;
      }

      for (let idx = 0; idx < createResult.data.length; idx++) {
        const item = createResult.data[idx];
        const sourceOrder = chunk[idx];

        if (item.status === 'Success') {
          const key = item.orderId || item.trackingNo;
          if (key) {
            createdOrderIds.push(key);
            if (sourceOrder) orderMetaById[key] = sourceOrder;
          }
        } else if (item.errors?.length) {
          createErrors.push(`Dòng ${i + idx + 1}: ${item.errors.map((e) => e.message).join(';\n')}`);
        }
      }
    }

    if (!createdOrderIds.length) {
      return ApiResponse.badRequest(
        res,
        createErrors.length ? createErrors : ['Không có đơn nào tạo thành công.']
      );
    }

    const labelResult = await printLabels(createdOrderIds);

    if (!labelResult?.data) {
      return ApiResponse.badRequest(res, ['Print Label thất bại.']);
    }

    await batchInsertLabels(labelResult.data, orderMetaById, userId);

    const successCount = createdOrderIds.length;
    const errorCount = createErrors.length;
    const messages = `Thành công ${successCount} đơn.`;

    if (errorCount > 0) {
      return ApiResponse.send(res, 200, {
        messages,
        errorMessages: createErrors,
        data: { createdOrderIds, successCount, errorCount },
      });
    }

    return ApiResponse.success(res, { createdOrderIds, successCount, errorCount }, messages);
  } catch (err) {
    console.error('ETower import error:', err);
    return ApiResponse.serverError(res, 'Có lỗi xảy ra khi xử lý eTower.');
  }
};

const getEtowerLabels = async (req, res) => {
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

    const baseWhere = `FROM ksn_label_etower WHERE OrderId <> '' ${querySearch}`;

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
    console.error('Get eTower labels error:', err);
    return ApiResponse.serverError(res);
  }
};

const downloadEtowerLabel = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sqlService.query(
      'SELECT Id, OrderId, LabelUrl FROM ksn_label_etower WHERE Id = ? LIMIT 1',
      [id]
    );

    if (!rows?.length) {
      return ApiResponse.notFound(res, 'Không tìm thấy label.');
    }

    const label = rows[0];
    const labelUrl = label.LabelUrl || label.labelUrl;

    if (!labelUrl) {
      return ApiResponse.badRequest(res, 'Label không có URL.');
    }

    const response = await axios.get(labelUrl, { responseType: 'arraybuffer' });
    const fileName = `label-${label.OrderId || label.orderId || id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('Download eTower label error:', err);
    return ApiResponse.serverError(res, 'Có lỗi xảy ra khi tải label.');
  }
};

const downloadEtowerLabelsZip = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || !ids.length) {
      return ApiResponse.badRequest(res, 'Danh sách Id không hợp lệ.');
    }

    const [rows] = await sqlService.query(
      `SELECT Id, OrderId, LabelUrl FROM ksn_label_etower WHERE Id IN (${ids.map(() => '?').join(',')})`,
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
    res.setHeader('Content-Disposition', 'attachment; filename="etower-labels.zip"');
    return res.send(zipBuffer);
  } catch (err) {
    console.error('Download eTower labels zip error:', err);
    return ApiResponse.serverError(res, 'Có lỗi xảy ra khi tải zip label.');
  }
};

const EXCEL_COLUMNS = [
  'Tracking No', 'Tracking Barcode', 'Ref No.1', 'Master Ref No.',
  'Ref No.', 'Past Tracking Number', 'Recipient Name', 'Recipient Company',
  'Recipient addressline1', 'Recipient addressline2', 'Recipient addressline3',
  'City/Suburb', 'State', 'Postcode', 'Country', 'Phone', 'Email',
];

function buildExcelRow(order, label) {
  return {
    'Tracking No': order.trackingNo || '',
    'Tracking Barcode': label.barCode || '',
    'Ref No.1': '',
    'Master Ref No.': label.orderId || '',
    'Ref No.': order.referenceNo || '',
    'Past Tracking Number': order.trackingNo || '',
    'Recipient Name': order.recipientName || '',
    'Recipient Company': order.recipientCompany || '',
    'Recipient addressline1': order.addressline1 || '',
    'Recipient addressline2': order.addressline2 || '',
    'Recipient addressline3': order.addressline3 || '',
    'City/Suburb': order.city || '',
    'State': order.state || '',
    'Postcode': order.postcode || '',
    'Country': label.recipientCountry || '',
    'Phone': order.phone || '',
    'Email': order.email || '',
  };
}

function toExcelBuffer(rows) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows, { header: EXCEL_COLUMNS });

  ws['!cols'] = EXCEL_COLUMNS.map((col) => {
    const maxLen = Math.max(col.length, ...rows.map((r) => String(r[col] ?? '').length));
    return { wch: Math.min(maxLen + 2, 40) };
  });

  xlsx.utils.book_append_sheet(wb, ws, 'eTower Orders');
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function fetchEtowerData(orderIds) {
  const chunkSize = 300;
  const chunks = [];
  for (let i = 0; i < orderIds.length; i += chunkSize) {
    chunks.push(orderIds.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      Promise.all([queryOrders(chunk), gainLabelSpecs(chunk)])
    )
  );

  const orders = results.flatMap(([o]) => o?.data || []);
  const labels = results.flatMap(([, l]) => l?.data || []);
  return { orders, labels };
}

const exportEtowerExcel = async (req, res) => {
  try {
    const { orderIds } = req.body || {};

    if (!Array.isArray(orderIds) || !orderIds.length) {
      return ApiResponse.badRequest(res, 'Danh sách orderIds không hợp lệ.');
    }

    const { orders, labels } = await fetchEtowerData(orderIds);

    const labelMap = Object.fromEntries(
      labels.filter((l) => l.orderId).map((l) => [l.orderId, l])
    );

    const rows = orders
      .filter((item) => item.status === 'Success' && item.order)
      .map((item) => buildExcelRow(item.order, labelMap[item.orderId] || {}));

    if (!rows.length) {
      return ApiResponse.badRequest(res, 'Không có dữ liệu order nào hợp lệ để xuất Excel.');
    }

    const buffer = toExcelBuffer(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="etower-orders-export.xlsx"');
    return res.send(buffer);
  } catch (err) {
    console.error('Export eTower Excel error:', err);
    return ApiResponse.serverError(res, 'Có lỗi xảy ra khi xuất Excel.');
  }
};

module.exports = {
  importEtowerLabels,
  getEtowerLabels,
  downloadEtowerLabel,
  downloadEtowerLabelsZip,
  exportEtowerExcel,
};
