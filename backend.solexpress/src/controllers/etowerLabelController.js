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
  const response = await axios.post(url, orders, { headers });
  return response.data;
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
  const response = await axios.post(url, body, { headers });
  return response.data;
}

/**
 * Parse Excel theo template: dòng 1 = tên cột (hiển thị), dòng 2 = key body (mapping), từ dòng 3 = dữ liệu.
 * Trả về mảng object, mỗi object key theo dòng 2.
 */
function parseExcelWithTemplate(sheet) {
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rawRows.length || rawRows.length < 3) {
    return null;
  }
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

/**
 * Parse Excel/CSV format cũ: dòng 1 = header (key body), từ dòng 2 = dữ liệu.
 */
function parseExcelWithFirstRowHeader(sheet) {
  return xlsx.utils.sheet_to_json(sheet);
}

const importEtowerLabels = async (req, res) => {
  if (!req.file) {
    return res.json(ApiResponse.badRequest('Vui lòng upload file CSV hoặc Excel (.xlsx).'));
  }

  const userId = req.user.username;

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // Template mới: dòng 1 = tên cột, dòng 2 = mapping body, từ dòng 3 = data
    let rows = parseExcelWithTemplate(sheet);
    let dataStartRow = 3;
    if (!rows || rows.length === 0) {
      // Fallback: format cũ (dòng 1 = header, từ dòng 2 = data)
      rows = parseExcelWithFirstRowHeader(sheet);
      dataStartRow = 2;
      if (!rows.length) {
        return res.json(ApiResponse.badRequest('File không có dữ liệu.'));
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

      if (!createResult || !createResult.data) {
        createErrors.push('Create Shipping Orders thất bại.');
        continue;
      }

      (createResult.data || []).forEach((item, index) => {
        const sourceOrder = chunk[index];
        if (item.status === 'Success') {
          const key = item.orderId || item.trackingNo;
          if (key) {
            createdOrderIds.push(key);
            if (sourceOrder) {
              orderMetaById[key] = sourceOrder;
            }
          }
        } else if (item.errors && item.errors.length) {
          const msg = item.errors.map((e) => e.message).join('; ');
          createErrors.push(`Dòng ${i + index + 1}: ${msg}`);
        }
      });
    }

    if (!createdOrderIds.length) {
      const message = createErrors.length
        ? createErrors.join('. ')
        : 'Không có đơn nào tạo thành công.';
      return res.json(ApiResponse.badRequest(message));
    }

    const labelResult = await printLabels(createdOrderIds);

    if (!labelResult || !labelResult.data) {
      return res.json(ApiResponse.badRequest('Print Label thất bại.'));
    }

    const labelData = labelResult.data || [];

    for (const item of labelData) {
      console.log(item, createdOrderIds);
      if (item.status !== 'Success') {
        continue;
      }

      const key = item.orderId || item.trackingNo;
      const meta = key ? orderMetaById[key] || {} : {};

      await sqlService.query(
        'INSERT INTO ksn_label_etower (OrderId, LabelUrl, Datetime, ReferenceNo, State, Postcode, ServiceCode, Status, UserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          item.orderId || '',
          item.labelUrl || '',
          new Date(),
          meta.referenceNo || item.referenceNo || '',
          meta.state || '',
          meta.postcode || '',
          meta.serviceCode || '',
          item.status,
          userId,
        ]
      );
    }

    const successCount = createdOrderIds.length;
    const errorCount = createErrors.length;
    let message = `Thành công ${successCount} đơn.`;
    if (errorCount > 0) {
      message += ` ${errorCount} đơn lỗi (chi tiết trong response).`;
    }

    return res.json(
      ApiResponse.success({ createdOrderIds, createErrors, successCount, errorCount }, message)
    );
  } catch (err) {
    console.error('ETower import error:', err);
    return res.json(
      ApiResponse.badRequest('Có lỗi xảy ra khi xử lý eTower.')
    );
  }
};

const getEtowerLabels = async (req, res) => {
  try {
    const { textSearch, pageIndex, pageSize, sortField, isDesc } =
      new GetLabelsRequest(req.query);

    if (!pageIndex || pageIndex < 1) {
      return res.json(ApiResponse.error('PageIndex không đúng.'));
    }

    if (!pageSize || pageSize < 1) {
      return res.json(ApiResponse.error('PageSize không đúng.'));
    }

    const queryParams = [];
    let querySearch = '';

    if (textSearch && textSearch.trim() !== '') {
      const escapedSearch = textSearch
        .trim()
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
      const likeValue = `%${escapedSearch}%`;
      querySearch =
        'AND ( OrderId LIKE ? OR ReferenceNo LIKE ? OR State LIKE ? OR Postcode LIKE ?)';
      queryParams.push(likeValue, likeValue, likeValue, likeValue);
    }

    const countQuery = `SELECT COUNT(*) AS total FROM ksn_label_etower WHERE OrderId <> '' ${querySearch} `;
    const [countRows] = await sqlService.query(countQuery, queryParams);
    const total = countRows[0]?.total || 0;

    const dataQuery = `SELECT * FROM ksn_label_etower WHERE OrderId <> '' ${querySearch} ORDER BY ${sortField} ${
      isDesc ? 'DESC' : 'ASC'
    } LIMIT ? OFFSET ?`;
    const limit = parseInt(pageSize);
    const offset = (parseInt(pageIndex) - 1) * limit;
    queryParams.push(limit, offset);

    const [data] = await sqlService.query(dataQuery, queryParams);

    const response = new LablesResponse(
      total,
      data,
      limit,
      parseInt(pageIndex)
    );
    res.json(ApiResponse.success(response, 'Successful'));
  } catch (err) {
    console.error('Có lỗi xảy ra:', err);
    res.status(500).json(ApiResponse.error('Internal Server Error'));
  }
};

const downloadEtowerLabel = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await sqlService.query(
      'SELECT * FROM ksn_label_etower WHERE Id = ? LIMIT 1',
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Không tìm thấy label.'));
    }

    const label = rows[0];

    if (!label.LabelUrl && !label.labelUrl) {
      return res.status(400).json(ApiResponse.error('Label không có URL.'));
    }

    const labelUrl = label.LabelUrl || label.labelUrl;

    const response = await axios.get(labelUrl, {
      responseType: 'arraybuffer',
    });

    const fileName = `label-${label.OrderId || label.orderId || id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );

    return res.send(Buffer.from(response.data));
  } catch (err) {
    console.error('Download eTower label error:', err);
    return res
      .status(500)
      .json(ApiResponse.error('Có lỗi xảy ra khi tải label.'));
  }
};

const downloadEtowerLabelsZip = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || !ids.length) {
      return res
        .status(400)
        .json(ApiResponse.error('Danh sách Id không hợp lệ.'));
    }

    const [rows] = await sqlService.query(
      `SELECT * FROM ksn_label_etower WHERE Id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    if (!rows || !rows.length) {
      return res
        .status(404)
        .json(ApiResponse.error('Không tìm thấy label nào tương ứng.'));
    }

    const zip = new JSZip();

    for (const label of rows) {
      const labelUrl = label.LabelUrl || label.labelUrl;
      if (!labelUrl) {
        continue;
      }

      try {
        const response = await axios.get(labelUrl, {
          responseType: 'arraybuffer',
        });
        const fileName = `label-${label.OrderId || label.orderId || label.Id}.pdf`;
        zip.file(fileName, response.data);
      } catch (err) {
        // Nếu 1 file lỗi thì bỏ qua, vẫn nén các file còn lại
        // Có thể log chi tiết nếu cần
        console.error('Error fetching label for zip:', err.message || err);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="etower-labels.zip"'
    );

    return res.send(zipBuffer);
  } catch (err) {
    console.error('Download eTower labels zip error:', err);
    return res
      .status(500)
      .json(ApiResponse.error('Có lỗi xảy ra khi tải zip label.'));
  }
};

module.exports = {
  importEtowerLabels,
  getEtowerLabels,
  downloadEtowerLabel,
  downloadEtowerLabelsZip,
};

