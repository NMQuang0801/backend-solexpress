class LablesResponse {
  constructor(total, data, pageSize, pageIndex) {
    this.total = total;
    this.data = data;
    this.pageSize = pageSize;
    this.pageIndex = pageIndex;
  }
}

module.exports = { LablesResponse };