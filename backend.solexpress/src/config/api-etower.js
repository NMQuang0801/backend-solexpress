const crypto = require("crypto");

const API_ETOWER_CONFIG = {
  baseUrl: process.env.URL_ETOWER_BASE,
  token: process.env.ETOWER_TOKEN,
  secret: process.env.ETOWER_SECRET,
  createOrdersPath: "/services/shipper/orders",
  printLabelPath: "/services/shipper/labels",
  buildHeaders(method, path) {
    const token = this.token || "";
    const secret = this.secret || "";
    const url = `${this.baseUrl}${path}`;

    const wallTechDate = new Date().toUTCString();
    const signPayload = `${method}\n${wallTechDate}\n${url}`;

    const signature = crypto
      .createHmac("sha1", secret)
      .update(signPayload, "utf8")
      .digest("base64");

      return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-WallTech-Date": wallTechDate,
      Authorization: `WallTech ${token}:${signature}`,
    };
  },
};

module.exports = { API_ETOWER_CONFIG };
