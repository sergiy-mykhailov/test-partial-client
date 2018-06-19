import { Report as IReport, ReportInput as IReportInput } from '../types/Report';
import BaseService from './baseService';

export default class ReportsService extends BaseService {
  static reportsRoute = SERVICES.WORKFILE_REPORTS;

  static requestCache: Map<string, Array<IReport> | IReport> = new Map();

  public static async getReports(workfile_id: number | string): Promise<Array<IReport>> {
    try {
      var reports = await this.getRequest<Array<IReport>>(
        this.buildRoute(this.reportsRoute, { workfile_id: workfile_id }),
        true
      );
      return reports;
    } catch (err) {
      return [{ report: err }];
    }
  }

  public static async createReport(
    workfile_id: number | string,
    report: IReportInput
  ): Promise<IReport> {
    let route = this.buildRoute(this.reportsRoute, {
      workfile_id: workfile_id
    });
    return await this.postJSONRequest<IReportInput, IReport>(route, report);
  }
  //
  // public static async updateReport(
  //   workfile_id: number | string,
  //   report_id: number | string,
  //   report: IReportInput
  // ): Promise<IReport> {
  //   let route = this.buildRoute(this.reportsRoute, {
  //     workfile_id: workfile_id,
  //     report_id: report_id
  //   });
  //   return await this.putJSONRequest<IReportInput, IReport>(route, report);
  // }
}
