const axios = require("axios");
const sqlService = require("../config/db");
const { API_ETOWER_CONFIG } = require("../config/api-etower");
const { LABEL_MESSAGES } = require("../config/api-labels");

const PRINT_BATCH_SIZE = 20;
const PRINT_MAX_RETRIES = 3;
const PRINT_TIMEOUT_MS = 120000;

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function splitSearchValues(str) {
  return str
    ? str
        .replace(/[\n\r;, ]+/g, ",")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

async function printLabelsWithRetry(orderIds) {
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
  const headers = API_ETOWER_CONFIG.buildHeaders("POST", path);

  let lastError;
  for (let attempt = 1; attempt <= PRINT_MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(url, body, {
        headers,
        timeout: PRINT_TIMEOUT_MS,
      });
      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < PRINT_MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

async function insertOrderMappings(mappings, userId) {
  if (!mappings.length) return;

  for (const item of mappings) {
    if (!item.referenceNo || !item.orderId) continue;
    await sqlService.query(
      `INSERT INTO ksn_etower_order_mapping (ReferenceNo, TrackingNo, OrderId, UserId)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         TrackingNo = COALESCE(VALUES(TrackingNo), TrackingNo),
         OrderId = VALUES(OrderId),
         UserId = VALUES(UserId)`,
      [item.referenceNo, item.trackingNo || null, item.orderId, userId],
    );
  }
}

async function updateOrderMappingsTracking(labelData) {
  for (const item of labelData) {
    if (item.status !== "Success") continue;
    const ref = item.referenceNo || "";
    const orderId = item.orderId || "";
    const trackingNo = item.trackingNo || null;
    if (!ref && !orderId) continue;

    await sqlService.query(
      `UPDATE ksn_etower_order_mapping
       SET TrackingNo = COALESCE(?, TrackingNo)
       WHERE ReferenceNo = ? OR OrderId = ?`,
      [trackingNo, ref || orderId, orderId || ref],
    );
  }
}

async function insertPrintErrors(errors, userId) {
  if (!errors.length) return;

  for (const err of errors) {
    if (!err.referenceNo && !err.orderId) continue;
    await sqlService.query(
      `INSERT INTO ksn_etower_print_error (ReferenceNo, TrackingNo, OrderId, ErrorMessage, UserId)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         ErrorMessage = VALUES(ErrorMessage),
         TrackingNo = COALESCE(VALUES(TrackingNo), TrackingNo),
         UserId = VALUES(UserId),
         CreatedDate = CURRENT_TIMESTAMP`,
      [
        err.referenceNo || null,
        err.trackingNo || null,
        err.orderId || err.referenceNo,
        err.errorMessage || "Print Label thất bại.",
        userId,
      ],
    );
  }
}

async function deletePrintErrorsByRefs(refs) {
  const normalized = refs.filter(Boolean);
  if (!normalized.length) return;

  await sqlService.query(
    `DELETE FROM ksn_etower_print_error WHERE ReferenceNo IN (${normalized.map(() => "?").join(",")})`,
    normalized,
  );
}

async function batchInsertLabels(labelData, orderMetaByRef, userId, orders) {
  const insertRows = [];

  for (const item of labelData) {
    if (item.status !== "Success") continue;

    const meta =
      orderMetaByRef[item.referenceNo] ||
      orderMetaByRef[item.orderId] ||
      {};
    const order = orders.find(
      (o) => String(o.referenceNo) === String(meta.referenceNo || item.referenceNo),
    );

    insertRows.push([
      meta.orderId || item.orderId || "",
      item.labelUrl || "",
      new Date(),
      meta.referenceNo || item.referenceNo || "",
      item.trackingNo || "",
      order?.state || "",
      order?.postcode || "",
      order?.serviceCode || "",
      item.status
        ?.replaceAll(LABEL_MESSAGES.SUCCESS_CN, LABEL_MESSAGES.SUCCESS_VI)
        ?.replaceAll(LABEL_MESSAGES.SUCCESS_EN, LABEL_MESSAGES.SUCCESS_VI) ??
        LABEL_MESSAGES.SUCCESS_VI,
      userId,
    ]);
  }

  if (!insertRows.length) return;

  const placeholders = insertRows
    .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .join(", ");
  const flatValues = insertRows.flat();

  await sqlService.query(
    `INSERT INTO ksn_label_etower (OrderId, LabelUrl, Datetime, ReferenceNo, TrackingNo, State, Postcode, ServiceCode, Status, UserId) VALUES ${placeholders}`,
    flatValues,
  );
}

async function printLabelsBatched(referenceNos, orderMetaByRef, userId, orders = []) {
  const allLabelData = [];
  const printErrors = [];
  const batches = chunkArray(referenceNos, PRINT_BATCH_SIZE);

  for (const batch of batches) {
    try {
      const result = await printLabelsWithRetry(batch);
      if (!result?.data?.length) {
        for (const ref of batch) {
          printErrors.push({
            referenceNo: ref,
            orderId: orderMetaByRef[ref]?.orderId || null,
            errorMessage: "Print Label thất bại - không có dữ liệu trả về.",
          });
        }
        continue;
      }

      const successRefs = [];
      const failedInBatch = [];

      for (const item of result.data) {
        if (item.status === "Success") {
          allLabelData.push(item);
          if (item.referenceNo) successRefs.push(item.referenceNo);
        } else {
          failedInBatch.push({
            referenceNo: item.referenceNo || null,
            orderId: item.orderId || null,
            trackingNo: item.trackingNo || null,
            errorMessage:
              item.errors?.map((e) => e.message).join("; ") ||
              "Print Label thất bại.",
          });
        }
      }

      for (const ref of batch) {
        const matched = result.data.find(
          (item) => String(item.referenceNo) === String(ref),
        );
        if (!matched) {
          failedInBatch.push({
            referenceNo: ref,
            orderId: orderMetaByRef[ref]?.orderId || null,
            errorMessage: "Không nhận được kết quả in nhãn.",
          });
        }
      }

      if (successRefs.length) {
        await deletePrintErrorsByRefs(successRefs);
      }
      printErrors.push(...failedInBatch);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Print Label thất bại.";
      for (const ref of batch) {
        printErrors.push({
          referenceNo: ref,
          orderId: orderMetaByRef[ref]?.orderId || null,
          errorMessage: message,
        });
      }
    }
  }

  if (allLabelData.length) {
    await batchInsertLabels(allLabelData, orderMetaByRef, userId, orders);
    await updateOrderMappingsTracking(allLabelData);
  }

  if (printErrors.length) {
    await insertPrintErrors(printErrors, userId);
  }

  return {
    allLabelData,
    printErrors,
    successCount: allLabelData.length,
    errorCount: printErrors.length,
  };
}

async function lookupMappingsByRefOrTracking(referenceNos, trackingNos) {
  const refs = splitSearchValues(referenceNos);
  const tracks = splitSearchValues(trackingNos);
  if (!refs.length && !tracks.length) {
    return { mappings: [], refsForPrint: [] };
  }

  const conditions = [];
  const params = [];

  if (refs.length) {
    conditions.push(
      `ReferenceNo IN (${refs.map(() => "?").join(",")})`,
    );
    params.push(...refs);
  }
  if (tracks.length) {
    conditions.push(
      `TrackingNo IN (${tracks.map(() => "?").join(",")})`,
    );
    params.push(...tracks);
  }

  const [rows] = await sqlService.query(
    `SELECT ReferenceNo, TrackingNo, OrderId FROM ksn_etower_order_mapping WHERE ${conditions.join(" OR ")}`,
    params,
  );

  const mappings = rows || [];
  const refsForPrint = [
    ...new Set(mappings.map((m) => m.ReferenceNo).filter(Boolean)),
  ];

  return { mappings, refsForPrint };
}

async function buildOrderMetaFromMappings(mappings) {
  const orderMetaByRef = {};
  for (const m of mappings) {
    if (!m.ReferenceNo) continue;
    orderMetaByRef[m.ReferenceNo] = {
      referenceNo: m.ReferenceNo,
      orderId: m.OrderId,
      trackingNo: m.TrackingNo,
    };
  }
  return orderMetaByRef;
}

async function getAllPrintErrors() {
  const [rows] = await sqlService.query(
    `SELECT Id, ReferenceNo, TrackingNo, OrderId, ErrorMessage, UserId, CreatedDate
     FROM ksn_etower_print_error ORDER BY CreatedDate DESC`,
  );
  return rows || [];
}

async function buildOrderMetaFromErrors(errors) {
  const orderMetaByRef = {};
  for (const e of errors) {
    if (!e.ReferenceNo) continue;
    orderMetaByRef[e.ReferenceNo] = {
      referenceNo: e.ReferenceNo,
      orderId: e.OrderId,
      trackingNo: e.TrackingNo,
    };
  }
  return orderMetaByRef;
}

module.exports = {
  PRINT_BATCH_SIZE,
  chunkArray,
  splitSearchValues,
  printLabelsWithRetry,
  printLabelsBatched,
  insertOrderMappings,
  updateOrderMappingsTracking,
  insertPrintErrors,
  deletePrintErrorsByRefs,
  batchInsertLabels,
  lookupMappingsByRefOrTracking,
  buildOrderMetaFromMappings,
  getAllPrintErrors,
  buildOrderMetaFromErrors,
};
