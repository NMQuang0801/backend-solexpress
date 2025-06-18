const csv = require('csv-parser');
const axios = require('axios');
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
  return JSON.stringify([{
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
  }]);
}
//#endregion

const importLabels = async (req, res) => {
  const results = [];
  const stream = require('stream');

  if (!req.file || req.file.mimetype !== 'text/csv') {
    return res.json(ApiResponse.badRequest('Invalid file type. Please upload a CSV file.'));
  }
  const userId = req.user.username;
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let countOfCases = 0;
        let orderItems = '';
        let currentRef = null;
        console.log(results);
        for (const line of results) {
          if (line['serviceType'] && line['recipientName']) {
            currentRef = line['referenceNo'];
            orderItems = buildBoxItem(line);
          } else if (!line['serviceType'] && !line['recipientName']) {
            countOfCases++;
            orderItems += ',' + buildBoxItem(line, countOfCases);
          }
          countOfCases++;
          if (countOfCases == line['itemCount']) {
            const jsonPayload = buildJsonPayload(line, orderItems);
            try {
              const response = await axios.post(
                'https://omsapi.worldtech.eu/API/order/BatchAdd',
                jsonPayload,
                {
                  headers: {
                    Authorization: 'Basic ' + Buffer.from('AU0274360&x+nnRWjB14HnKgOZ6xGUbQ==').toString('base64'),
                    'Content-Type': 'application/json'
                  }
                }
              );
              if (response && response.data) {
                const result = response.data;
                if (result.item && result.item[0]) {
                  await sqlService.query(
                    'INSERT INTO ksn_label (OrderId, LabelUrl, Datetime, ReferenceNo, State, Postcode, ServiceCode, Status, UserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                      result.item[0].OrderId,
                      result.item[0].LabelUrls[0].LabelUrl,
                      new Date().toISOString().slice(0, 19).replace('T', ' '),
                      line.referenceNo,
                      line.state,
                      line.postcode,
                      line.serviceType,
                      result.ResultDesc,
                      userId
                    ]
                  );
                }
              } else {
                res.json(ApiResponse.badRequest('Có lỗi xảy ra'));
              }
            } catch (err) {
              console.error('API Error:', err.message);
              res.json(ApiResponse.badRequest(err.message));
            }
            countOfCases = 0;
            orderItems = '';
          }
        }
        res.json(ApiResponse.success(results, 'Successful'));
      })
      .on('error', (err) => {
        console.error('CSV Parse Error:', err);
        res.json(ApiResponse.badRequest('CSV parsing failed'));
      });
  } catch (error) {
    console.error('Error:', error);
    return res.json(ApiResponse.badRequest(error));
  }
};

const getLabels = async (req, res) => {
  try {
    const { pageIndex = 1, pageSize = 20 } = req.query;

    if (!pageIndex || pageIndex < 1) {
      return res.json(ApiResponse.error('pageIndex is incorrect'));
    }

    if (!pageSize || pageSize < 1) {
      return res.json(ApiResponse.error('pageSize is incorrect'));
    }

    const userId = req.user.id;

    const countQuery = `SELECT COUNT(*) AS total FROM ksn_label WHERE OrderId <> '' AND UserId = ? `;
    const [countRows] = await sqlService.query(countQuery, [userId]);
    const total = countRows[0]?.total || 0;

    const dataQuery = `SELECT * FROM ksn_label WHERE OrderId <> '' AND UserId = ? ORDER BY id DESC LIMIT ? OFFSET ?`;
    const limit = parseInt(pageSize);
    const offset = (parseInt(pageIndex) - 1) * limit;
    const [data] = await sqlService.query(dataQuery, [userId, limit, offset]);

    const response = new LablesResponse(total, data, limit, parseInt(pageIndex));
    res.json(ApiResponse.success(response, 'Successful'));
  } catch (err) {
    console.error('Error in getLabels:', err);
    res.status(500).json(ApiResponse.error('Internal Server Error'));
  }
};

module.exports = { importLabels, getLabels };