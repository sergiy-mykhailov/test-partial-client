import { ISaleLabel } from '../shared/components/labels';

export interface VisibleRows {
  name: string;
  tableView: ISaleLabel[];
  mapView: ISaleLabel[];
  detailView: ISaleLabel[];
}

export interface UserPreferences {
  visibleRows: VisibleRows[];
}

export interface UserPreferencesResponse {
  data: UserPreferences;
}
