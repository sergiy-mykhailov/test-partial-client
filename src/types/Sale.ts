export interface MinMax {
  min: number;
  max?: number;
}

export interface SaleFilter {
  counties?: string[];
  acres?: MinMax;
  cost?: MinMax;
  months_ago?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  polygon?: string;
  improvements?: string;
  highest_best_use?: string;
  land_use?: string;
  property_type?: string;
  category_type?: string;
  commodity_type?: string;
  workfile_id?: string;
}

export interface Improvement {
  id?: number;
  name: string;
  condition: string;
  cost_per_unit: number;
  size: number;
  unit_type: string;
  utility_type: string;
  total_life: number;
  remaining_life: number;
  age: number;
  rcn_per_unit: number;
  rcn_total: number;
  rcn_after_physical: number;
  rcn_after_functional: number;
  rcn_after_external: number;
  percent_physical: number;
  percent_functional: number;
  percent_external: number;
  kind: string;
  comment: string;
  total_percent_physical: number;
  total_percent_functional: number;
  total_percent_external: number;
  total_total_depreciation: number;
  total_rcn: number;
  total_contribution: number;
  contribution_percent: number;
}

export interface ImprovementsGroup {
  id?: number;
  name: string;
  ids: number[];
  improvements_names?: string[];
}

export interface Sale {
  id?: number;
  property_id?: number;
  parcel_id: string;
  grantor: string;
  grantee: string;
  sale_date: string;
  description: string;
  county: string;
  section: string;
  township: string;
  range: string;
  total_acres: number;
  cost_per_acre: number;
  comments: string;

  sale_state: string;
  verification: string;

  coords: string;
  highest_best_use: string;
  land_use_type: string;
  property_type: string;
  category_type: string;
  commodity_type: string;
  improvements: Improvement[];

  state: string;
  motivation: string;
  area: string;
  location: string;
  sale_price: number;
  net_sale_price: number;
  cev_price: number;
  financing: string;
  percent_financing_adjustment: number;
  sca_unit_type_name: string;
  effective_unit_size: number;
  sca_dollar_per_unit: number;
  multiplier_unit: string;
  multiplier: number;
  is_improved: boolean;
  region: string;
  legal_access: string;
  physical_access: string;
  view: string;
  utilities: string;
  tax_id_recording: string;
  zip: number;
  prior_sale_date: string;
  assured_grazing: string;
  rule_set: string;
  address: string;
  zone: string;
  source: string;
  hidden?: boolean;
  status?: string | null;
}

export interface NewSale {
  parcel_id: string;
  grantor: string;
  grantee: string;
  sale_date: string;
  description: string;
  county: string;
  section: string;
  township: string;
  range: string;
  total_acres: number;
  cost_per_acre: number;

  sale_state: string;
  verification: string;

  adjusted_price?: number;
  year?: number;
  simple_interest_rate?: number;
  auto_time_adjustment?: number;
  time_adjusted_price?: number;
  sale_adjustment?: number;
  irrigation_adjustment?: number;
  highest_best_use?: string;
  land_use_type?: string;
  property_type?: string;
  category_type?: string;
  commodity_type?: string;

  state?: string;
  motivation?: string;
  area?: string;
  location?: string;
  sale_price?: number;
  net_sale_price?: number;
  cev_price?: number;
  financing?: string;
  percent_financing_adjustment?: number;
  sca_unit_type_name?: string;
  effective_unit_size?: number;
  sca_dollar_per_unit?: number;
  multiplier_unit?: string;
  multiplier?: number;
  is_improved?: boolean;
  region?: string;
  legal_access?: string;
  physical_access?: string;
  view?: string;
  utilities?: string;
  tax_id_recording?: string;
  zip?: number;
  prior_sale_date?: string;
  assured_grazing?: string;
  rule_set?: string;
  address?: string;
  zone?: string;
  source?: string;
}

export interface LandDeeded {
  id: number;
  name: string;
  ratio: number;
  total_value: number;
  acres: number;
  dollar_per_acre: number;
}

export interface CommonAttributes {
  highest_best_use: string[];
  land_use_type: string[];
  property_type: string[];
  category_type: string[];
  commodity_type: string[];
  source: string[];
}
