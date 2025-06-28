export interface Label {
  id: number;
  datetime: string;
  orderId: string;
  state: string;
  postcode: string;
  referenceNo: string;
  status: string;
  labelUrl?: string;
}

export interface LabelsResponse {
  data: Label[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export const LabelTableColumns = [
  { label: 'Id', field: 'Id' },
  { label: 'Date', field: 'Datetime' },
  { label: 'ID Label', field: 'OrderId' },
  { label: 'State', field: 'State' },
  { label: 'Post Code', field: 'Postcode' },
  { label: 'Reference Code', field: 'ReferenceNo' },
  { label: 'Status' },
  { label: 'Link' },
];
