import { Appraiser as IAppraiser, AppraiserInput as IAppraiserInput } from '../types';
import { File as IFile, FileInput as IFileInput } from '../types';
import BaseService from './baseService';

export default class AppraiserService extends BaseService {
  static appraiserRoute = SERVICES.APPRAISER;
  static appraisersRoute = SERVICES.APPRAISERS;
  static appraiserFilesRoute = SERVICES.APPRAISER_FILES;
  static appraiserFileRoute = SERVICES.APPRAISER_FILE;
  static workfileAppraiserRoute = SERVICES.WORKFILE_APPRAISER;

  public static async getAppraisers(): Promise<Array<IAppraiser>> {
    return await this.getRequest<Array<IAppraiser>>(this.appraisersRoute, true);
  }

  public static async getAppraiser(id: string | number): Promise<IAppraiser> {
    return await this.getRequest<IAppraiser>(
      this.buildRoute(this.appraiserRoute, { appraiser_id: id }),
      true
    );
  }

  public static async createAppraiser(appraiser: IAppraiserInput): Promise<IAppraiser> {
    return await this.postJSONRequest<IAppraiserInput, IAppraiser>(this.appraiserRoute, appraiser);
  }

  public static async createWorkfileAppraiser(
    workfileId: string | number,
    appraiser: IAppraiserInput
  ): Promise<IAppraiser> {
    let route = this.buildRoute(this.workfileAppraiserRoute, { workfile_id: workfileId });
    return await this.postJSONRequest<IAppraiserInput, IAppraiser>(route, appraiser);
  }

  public static async getWorkfileAppraiser(workfileId: string | number): Promise<IAppraiser> {
    return await this.getRequest<IAppraiser>(
      this.buildRoute(this.workfileAppraiserRoute, { workfile_id: workfileId })
    );
  }

  public static async updateWorkfileAppraiser(
    appraiser: IAppraiserInput,
    workfileId: string | number,
    appraiserId: number | string
  ): Promise<IAppraiser> {
    return await this.putJSONRequest<IAppraiserInput, IAppraiser>(
      this.buildRoute(this.workfileAppraiserRoute, {
        workfile_id: workfileId,
        appraiser_id: appraiserId
      }),
      appraiser
    );
  }

  public static async updateAppraiser(
    appraiser: IAppraiserInput,
    appraiserId: string | number
  ): Promise<IAppraiser> {
    return await this.putJSONRequest<IAppraiserInput, IAppraiser>(
      this.buildRoute(this.appraiserRoute, { appraiser_id: appraiserId }),
      appraiser
    );
  }

  public static async removeAppraiser(id: string | number): Promise<IAppraiser> {
    return await this.deleteRequest<IAppraiser>(
      this.buildRoute(this.appraiserRoute, { appraiser_id: id })
    );
  }

  public static async getFiles(
    workfileId: string | number,
    appraiserId: string | number
  ): Promise<IFile[]> {
    const route = this.buildRoute(this.appraiserFilesRoute, {
      workfile_id: workfileId,
      appraiser_id: appraiserId
    });

    const files = await this.getRequest<IFile[]>(route);

    return files;
  }

  public static async createFile(
    workfileId: string | number,
    appraiserId: string | number,
    file: IFileInput
  ): Promise<IFile> {
    const route = this.buildRoute(this.appraiserFilesRoute, {
      workfile_id: workfileId,
      appraiser_id: appraiserId
    });

    return await this.postJSONRequest<IFileInput, IFile>(route, file);
  }
}
