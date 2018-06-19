export interface Boundary {
  id: string;
  name: string;
  polygon: string;
}

export interface BoundaryInput {
  name?: string;
  polygon?: number[][][] | number[][][][];
}
