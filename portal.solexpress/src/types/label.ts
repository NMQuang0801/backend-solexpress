export interface Label {
  id: number;
  datetime: string;
  orderId: string;
  state: string;
  postcode: string;
  referenceNo: string;
  trackingNo?: string;
  status: string;
  labelUrl?: string;
}

export interface LabelsResponse {
  data: Label[];
  total: number;
  pageIndex: number;
  pageSize: number;
}
