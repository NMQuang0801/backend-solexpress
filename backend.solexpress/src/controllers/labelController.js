const csv = require('csv-parser');
const axios = require('axios');
const stream = require('stream');
const sqlService = require('../config/db');
const ApiResponse = require('../utils/response');
const { LablesResponse } = require('../models/response/labelsResponse');

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
  return {
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
  };
}
//#endregion

const importLabels = async (req, res) => {
  if (!req.file || req.file.mimetype !== 'text/csv') {
    return res.json(ApiResponse.badRequest('File không đúng. Vui lòng upload file CSV.'));
  }

  const userId = req.user.username;
  const results = [];
  const errors = [];
  const successItems = [];

  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    const requestData = [];
    const orderMapping = new Map();
    let currentOrder = null;
    let currentOrderItems = [];
    let currentItemCount = 0;

    for (const line of results) {
      try {
        if (line.serviceType && line.recipientName) {
          if (currentOrder && currentOrderItems.length > 0) {
            const jsonPayload = buildJsonPayload(currentOrder, currentOrderItems);
            requestData.push(jsonPayload);
            orderMapping.set(currentOrder.referenceNo, currentOrder);
          }

          currentOrder = line;
          currentOrderItems = [buildBoxItem(line)];
          currentItemCount = 1;
        } else if (currentOrder && line.itemCount) {
          currentItemCount++;
          currentOrderItems.push(buildBoxItem(line, currentItemCount));

          if (currentItemCount >= Number(line.itemCount)) {
            const jsonPayload = buildJsonPayload(currentOrder, currentOrderItems);
            requestData.push(jsonPayload);
            orderMapping.set(currentOrder.referenceNo, currentOrder);

            currentOrder = null;
            currentOrderItems = [];
            currentItemCount = 0;
          }
        }
      } catch (innerErr) {
        console.error('Lỗi xử lý từng dòng:', innerErr);
        errors.push(`Đơn ${line.referenceNo || 'Unknown'}: ${innerErr.message}`);
      }
    }

    if (currentOrder && currentOrderItems.length > 0) {
      const jsonPayload = buildJsonPayload(currentOrder, currentOrderItems);
      requestData.push(jsonPayload);
      orderMapping.set(currentOrder.referenceNo, currentOrder);
    }

    if (requestData.length === 0) {
      return res.json(ApiResponse.badRequest('Không có dữ liệu hợp lệ để xử lý.'));
    }
    const response = await axios.post(
      'https://omsapi.worldtech.eu/API/order/BatchAdd',
      JSON.stringify(requestData),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from('AU0274360&x+nnRWjB14HnKgOZ6xGUbQ==').toString('base64'),
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const resData = response?.data;

    if (resData?.ResultCode === 0 || resData?.ResultDesc === '成功') {
      const items = resData?.item || [];

      if (items.length > 0) {
        try {
          const insertData = items.map(item => {
            const orderData = orderMapping.get(item.OrderNumber || item.ReferenceNo);
            return [
              item.OrderId,
              item.LabelUrls?.[0]?.LabelUrl || '',
              new Date().toISOString().slice(0, 19).replace('T', ' '),
              item.OrderNumber || item.ReferenceNo,
              orderData?.state || '',
              orderData?.postcode || '',
              orderData?.serviceType || '',
              resData.ResultDesc?.replaceAll('成功', 'Thành công') ?? 'Thành công',
              userId
            ];
          });

          const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
          const flatValues = insertData.flat();

          await sqlService.query(
            `INSERT INTO ksn_label 
              (OrderId, LabelUrl, Datetime, ReferenceNo, State, Postcode, ServiceCode, Status, UserId) 
              VALUES ${placeholders}`,
            flatValues
          );

          items.forEach(item => successItems.push(item.OrderId));

        } catch (dbError) {
          console.error('Database batch insert error:', dbError);

          console.log('Falling back to individual inserts...');
          const insertPromises = items.map(async (item) => {
            try {
              const orderData = orderMapping.get(item.OrderNumber || item.ReferenceNo);
              await sqlService.query(
                `INSERT INTO ksn_label 
                  (OrderId, LabelUrl, Datetime, ReferenceNo, State, Postcode, ServiceCode, Status, UserId) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  item.OrderId,
                  item.LabelUrls?.[0]?.LabelUrl || '',
                  new Date().toISOString().slice(0, 19).replace('T', ' '),
                  item.OrderNumber || item.ReferenceNo,
                  orderData?.state || '',
                  orderData?.postcode || '',
                  orderData?.serviceType || '',
                  resData.ResultDesc?.replaceAll('成功', 'Thành công') ?? 'Thành công',
                  userId
                ]
              );
              successItems.push(item.OrderId);
            } catch (individualError) {
              console.error('Individual insert error:', individualError);
              errors.push(`Lỗi lưu đơn ${item.OrderId}: ${individualError.message}`);
            }
          });

          await Promise.all(insertPromises);
        }
      }
    }
    else if (resData?.ResultCode === 1001 || resData?.ResultDesc === '失败') {
      const items = resData?.item || [];
      items.forEach(item => {
        errors.push(
          item?.Feedback?.replaceAll('客户单号重复', 'Số đơn hàng của khách hàng được lặp lại') ?? 'Có lỗi xảy ra'
        );
      });
    }
    else {
      errors.push(`API Error: ${resData?.ResultDesc || 'Có lỗi xảy ra khi gửi yêu cầu'}`);
    }

    if (errors.length > 0) {
      return res.json(ApiResponse.badRequest(errors.join('. ')));
    }

    return res.json(ApiResponse.success({
      successCount: successItems.length,
      successItems: successItems,
      totalProcessed: requestData.length
    }, 'Import thành công'));

  } catch (error) {
    console.error('Lỗi tổng quát:', error);

    if (error.code === 'ECONNABORTED') {
      return res.json(ApiResponse.badRequest('Yêu cầu timeout. Vui lòng thử lại.'));
    }

    if (error.response) {
      return res.json(ApiResponse.badRequest(`API Error: ${error.response.status} - ${error.response.statusText}`));
    }

    return res.json(ApiResponse.badRequest('Có lỗi xảy ra khi xử lý file'));
  }
};

const getLabels = async (req, res) => {
  try {
    const { textSearch = '', pageIndex = 1, pageSize = 20 } = req.query;

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

    const dataQuery = `SELECT * FROM ksn_label WHERE OrderId <> '' ${querySearch} ORDER BY id DESC LIMIT ? OFFSET ?`;
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