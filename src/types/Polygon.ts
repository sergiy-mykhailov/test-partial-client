export interface Polygon {
  id: string;
  group: string;
  polygon: string;
  property_id: string;
  area: number;
  hidden?: boolean;
  selected?: boolean;
}

export interface PolygonInput {
  group?: string;
  polygon?: [number, number][] | [number, number][][];
}
