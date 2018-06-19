export interface Tract {
  id: number;
  parcel_id: string;
  description: string;
  workfile_id: number;
  grantor: string;
  grantee: string;
  sale_date: Date;
  county: string;
  section: string;
  township: string;
  range: string;
  total_acres: number;
  cost_per_acre: number;
  comments: string;
  property_id?: number;
}

export interface NewTract {
  parcel_id: string;
  description: string;
  grantor: string;
  grantee: string;
  sale_date: Date;
  county: string;
  section: string;
  township: string;
  range: string;
  total_acres: number;
  cost_per_acre: number;
  comments: string;
}
