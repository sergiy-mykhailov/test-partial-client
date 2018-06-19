export type WorkfileStatus = 'in-progress' | 'in-review' | 'prospective' | 'completed' | 'revised';

export interface Workfile {
  id: string;
  name: string;
  status: WorkfileStatus;
  created_at: number;
  effective_sale_date: Date;
  client_name: string;
}

export interface WorkfileInput {
  name: string;
  client_name: string;
  effective_sale_date: string;
}

export interface WorkfileDuplicateParams {
  appraiser?: boolean;
  client?: boolean;
  subject_property?: boolean;
  selected_sales?: string[];
}
