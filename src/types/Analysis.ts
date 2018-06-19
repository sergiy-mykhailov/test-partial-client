type CellAttr = string | null;

export interface Cell {
  value: CellAttr;
  formula: CellAttr;
  error: CellAttr;
}

export type Analysis = Array<Array<Array<Cell | null>>>;

export interface AnalysisRequest {
  data: Analysis;
}

export interface AnalysisResponse {
  id: number;
  content: AnalysisRequest;
  workfile_id: number;
}
