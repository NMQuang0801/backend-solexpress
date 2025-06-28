class GetLabelsRequest {
  constructor({ pageIndex = 1, pageSize = 20, textSearch = '', sortField = 'Id', isDesc}) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.textSearch = textSearch;
    this.sortField = sortField;
    this.isDesc = isDesc !== undefined ? isDesc == 'true' : true;
  }
}

module.exports = { GetLabelsRequest };