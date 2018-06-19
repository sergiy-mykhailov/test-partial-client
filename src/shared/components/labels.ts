import { Sale as ISale, Improvement as IImprovement } from '../../types';

export interface ISaleLabel {
  key: keyof Partial<ISale>;
  label: string;
}

export const labels: ISaleLabel[] = [
  { key: 'parcel_id', label: 'Parcel ID' },
  { key: 'grantor', label: 'Grantor' },
  { key: 'grantee', label: 'Grantee' },
  { key: 'sale_date', label: 'Sale Date' },
  { key: 'description', label: 'Description' },
  { key: 'county', label: 'County' },
  { key: 'section', label: 'Section' },
  { key: 'township', label: 'Township' },
  { key: 'range', label: 'Range' },
  { key: 'total_acres', label: 'Total Acres' },
  { key: 'cost_per_acre', label: 'Cost/Acre' },
  { key: 'comments', label: 'Comments' },

  { key: 'sale_state', label: 'Sale State' },
  { key: 'verification', label: 'Verification' },
  { key: 'highest_best_use', label: 'Highest Best Use' },
  { key: 'land_use_type', label: 'Land Use Type' },
  { key: 'property_type', label: 'Property Type' },
  { key: 'category_type', label: 'Category Type' },
  { key: 'commodity_type', label: 'Commodity Type' },
  { key: 'improvements', label: 'Improvements' },

  { key: 'state', label: 'State' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'area', label: 'Area' },
  { key: 'location', label: 'Location' },
  { key: 'sale_price', label: 'Sale Price' },
  { key: 'net_sale_price', label: 'Net Sale Price' },
  { key: 'cev_price', label: 'CEV Price' },
  { key: 'financing', label: 'Financing' },
  { key: 'percent_financing_adjustment', label: 'Percent Financing Adjustment' },
  { key: 'sca_unit_type_name', label: 'SCA Unit Type' },
  { key: 'effective_unit_size', label: 'Effective Unit Size' },
  { key: 'sca_dollar_per_unit', label: 'SCA Dollar Per Unit' },
  { key: 'multiplier_unit', label: 'Multiplier Unit' },
  { key: 'multiplier', label: 'Multiplier' },
  { key: 'is_improved', label: 'Improved' },
  { key: 'region', label: 'Region' },
  { key: 'legal_access', label: 'Legal Access' },
  { key: 'physical_access', label: 'Physical Access' },
  { key: 'view', label: 'View' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'tax_id_recording', label: 'Tax ID' },
  { key: 'zip', label: 'Zip' },
  { key: 'prior_sale_date', label: 'Prior Sale Date' },
  { key: 'assured_grazing', label: 'Assured Grazing' },
  { key: 'rule_set', label: 'Rule Set' },
  { key: 'address', label: 'Address' },
  { key: 'zone', label: 'Zone' },
  { key: 'source', label: 'Source' }
];

export interface IImprovementLabel {
  key: keyof Partial<IImprovement>;
  label: string;
}

export const improvementsLabels: IImprovementLabel[] = [
  { key: 'name', label: 'Name' },
  { key: 'condition', label: 'Condition' },
  { key: 'cost_per_unit', label: 'Cost / Unit' },
  { key: 'size', label: 'Size' },
  { key: 'unit_type', label: 'Unit Type' },
  { key: 'utility_type', label: 'Utility Type' },
  { key: 'total_life', label: 'Total Live' },
  { key: 'remaining_life', label: 'Remaining Life' },
  { key: 'age', label: 'Age' },
  { key: 'rcn_per_unit', label: 'RCN / Unit' },
  { key: 'rcn_total', label: 'RCN Total' },
  { key: 'rcn_after_physical', label: 'RCN After Physical' },
  { key: 'rcn_after_functional', label: 'RCN After Functional' },
  { key: 'rcn_after_external', label: 'RCN After External' },
  { key: 'percent_physical', label: '% Physical' },
  { key: 'percent_functional', label: '% Functional' },
  { key: 'percent_external', label: '% External' },
  { key: 'kind', label: 'Kind' },
  { key: 'comment', label: 'Comment' },
  { key: 'total_percent_physical', label: 'Total % Physical' },
  { key: 'total_percent_functional', label: 'Total % Functional' },
  { key: 'total_percent_external', label: 'Total % External' },
  { key: 'total_total_depreciation', label: 'Total Depreciation' },
  { key: 'total_rcn', label: 'Total RCN' },
  { key: 'total_contribution', label: 'Total Contribution' },
  { key: 'contribution_percent', label: 'Contribution %' }
];
