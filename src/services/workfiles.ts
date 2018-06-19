import {
  Workfile as IWorkfile,
  WorkfileInput as IWorkfileInput,
  WorkfileDuplicateParams as IWorkfileDuplicateParams,
  Sale as ISale,
  Analysis as IAnalysis,
  AnalysisResponse,
  AnalysisRequest
} from '../types';
import BaseService from './baseService';

export default class WorkfilesService extends BaseService {
  static workfilesRoute = SERVICES.WORKFILES;
  static workfileRoute = SERVICES.WORKFILE;
  static workfileDuplicate = SERVICES.WORKFILE_DUPLICATE;
  static workfileSalesRoute = SERVICES.WORKFILE_SALES;
  static workfileSaleRoute = SERVICES.WORKFILE_SALE;
  static workfileSubjectRoute = SERVICES.WORKFILE_SUBJECT;
  static workfileAnalysisRoute = SERVICES.WORKFILE_ANALYSIS;

  static requestCache: Map<string, Array<IWorkfile> | IWorkfile> = new Map();

  public static async getWorkfiles(): Promise<Array<IWorkfile>> {
    return await this.getRequest<Array<IWorkfile>>(this.workfilesRoute, true);
  }

  public static async getWorkfile(id: number): Promise<IWorkfile> {
    return await this.getRequest<IWorkfile>(
      this.buildRoute(this.workfileRoute, { workfile_id: id }),
      true
    );
  }

  public static async duplicateWorkfile(
    id: number,
    params?: IWorkfileDuplicateParams
  ): Promise<IWorkfile> {
    const query = params ? this.buildQueryString(params) : '';

    const workfileDupeRoute = this.buildRoute(this.workfileDuplicate, { workfile_id: id });

    return await this.getRequest<IWorkfile>(workfileDupeRoute + query, true);
  }

  public static buildQueryString(params: IWorkfileDuplicateParams): string {
    const query = Object.keys(params).map(param => {
      // i.e. appraiser = true
      return param + '=' + params[param];
    });
    // Returns a string suitable for representing a DB query
    return '?' + query.join('&');
  }

  public static async createWorkfile(workfile: IWorkfileInput): Promise<IWorkfile> {
    return await this.postJSONRequest<IWorkfileInput, IWorkfile>(this.workfilesRoute, workfile);
  }

  public static async deleteWorkfile(id: number): Promise<string> {
    return await this.deleteRequest<string>(
      this.buildRoute(this.workfileRoute, { workfile_id: id })
    );
  }

  public static async getWorkfileSales(workfileId: number | string): Promise<number[]> {
    return await this.getRequest<number[]>(
      this.buildRoute(this.workfileSalesRoute, { workfile_id: workfileId }),
      true
    );
  }

  public static async getSubjectProperty(workfileId: number | string): Promise<ISale> {
    return await this.getRequest<ISale>(
      this.buildRoute(this.workfileSubjectRoute, { workfile_id: workfileId })
    );
  }

  public static async addWorkfileSale(
    workfileId: number | string,
    saleId: number
  ): Promise<number[]> {
    const addWorkfileRoute = this.buildRoute(this.workfileSaleRoute, {
      workfile_id: workfileId,
      sale_id: saleId
    });

    const workfileSales = await this.putJSONRequest<{ sale_id: number }, number[]>(
      addWorkfileRoute,
      {
        sale_id: saleId
      }
    );

    const workfileSalesRoute = this.buildRoute(this.workfileSalesRoute, {
      workfile_id: workfileId
    });

    this.updateCacheRequest<number[]>(workfileSalesRoute, () => workfileSales);

    return workfileSales;
  }

  public static async removeWorkfileSale(
    workfileId: number | string,
    saleId: number
  ): Promise<number[]> {
    const addWorkfileRoute = this.buildRoute(this.workfileSaleRoute, {
      workfile_id: workfileId,
      sale_id: saleId
    });

    const workfileSales = await this.deleteJSONRequest<{ sale_id: number }, number[]>(
      addWorkfileRoute,
      {
        sale_id: saleId
      }
    );

    const workfileSalesRoute = this.buildRoute(this.workfileSalesRoute, {
      workfile_id: workfileId
    });

    this.updateCacheRequest<number[]>(workfileSalesRoute, () => workfileSales);

    return workfileSales;
  }

  public static async getSubjectAnalysis(workfileId: number | string): Promise<IAnalysis | null> {
    const response = await this.getRequest<AnalysisResponse | null>(
      this.buildRoute(this.workfileAnalysisRoute, { workfile_id: workfileId })
    );
    return response.content.data;
  }

  public static async createWorkfileAnalysis(
    workfileId: number | string,
    analysisData: IAnalysis
  ): Promise<IAnalysis> {
    const response = await this.postJSONRequest<{ data: IAnalysis }, AnalysisResponse>(
      this.buildRoute(this.workfileAnalysisRoute, { workfile_id: workfileId }),
      { data: analysisData }
    );

    return response.content.data;
  }

  public static async updateWorkfileAnalysis(
    workfileId: number | string,
    analysisData: IAnalysis
  ): Promise<IAnalysis> {
    const response = await this.putJSONRequest<{ data: IAnalysis }, AnalysisResponse>(
      this.buildRoute(this.workfileAnalysisRoute, { workfile_id: workfileId }),
      { data: analysisData }
    );

    return response.content.data;
  }

  public static async deleteWorkfileAnalysis(workfileId: string | number): Promise<null> {
    return await this.deleteJSONRequest<null, null>(
      this.buildRoute(this.workfileAnalysisRoute, { workfile_id: workfileId })
    );
  }
}
