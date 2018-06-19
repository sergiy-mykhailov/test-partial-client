export interface Soil {
  id: number;
  area: number;
  musym: string;
  muname: string;
  polygon: string;
}

export interface GroupedSoil extends SoilClass {
  group_id: number;
  soil: Array<Soil>;
}

export interface SoilClass {
  id?: number;
  name: string;
  classes: Array<number>;
  type: string;
  pct: number;
}

export interface SoilClassGroup {
  id?: number;
  name: string;
  classes: SoilClassGroupClasses;
}

export interface SoilClassGroupClasses {
  irr: Array<SoilClass>;
  nirr: Array<SoilClass>;
}

export interface SoilData {
  soil_image_url: string;
  minimap_image_url: string;
  data: { data: Array<Object> };
}
