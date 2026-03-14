class GetLabelsRequest {
  constructor({
    pageIndex = 1,
    pageSize = 20,
    textSearch = '',
    dateFrom = '',
    dateTo = '',
    referenceNo = '',
    trackingNo = '',
    sortField = 'Id',
    isDesc,
  }) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.textSearch = textSearch;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.referenceNo = referenceNo;
    this.trackingNo = trackingNo;
    this.sortField = sortField;
    this.isDesc = isDesc !== undefined ? isDesc == 'true' : true;
  }
}

module.exports = { GetLabelsRequest };