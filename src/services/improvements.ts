import { ImprovementsGroup as IImprovementsGroup } from '../types';
import BaseService from './baseService';

export default class ImprovementsService extends BaseService {
  static improvementsGroupsRoute = SERVICES.IMPROVEMENTS_GROUPS;
  static improvementsGroupRoute = SERVICES.IMPROVEMENTS_GROUP;
  static improvementsRoute = SERVICES.IMPROVEMENTS;

  public static async getGroups(): Promise<Array<IImprovementsGroup>> {
    const route = this.buildRoute(this.improvementsGroupsRoute, {});
    return await this.getRequest<Array<IImprovementsGroup>>(route);
  }

  public static async createGroup(
    improvementsGroup: IImprovementsGroup
  ): Promise<IImprovementsGroup> {
    let route = this.buildRoute(this.improvementsGroupsRoute, {});
    return await this.postJSONRequest<IImprovementsGroup, IImprovementsGroup>(
      route,
      improvementsGroup
    );
  }

  public static async updateGroup(
    improvementsGroup: IImprovementsGroup
  ): Promise<IImprovementsGroup> {
    let route = this.buildRoute(this.improvementsGroupRoute, { group_id: improvementsGroup.id });
    return await this.putJSONRequest<IImprovementsGroup, IImprovementsGroup>(
      route,
      improvementsGroup
    );
  }

  public static async deleteGroup(group_id: number): Promise<void> {
    let route = this.buildRoute(this.improvementsGroupRoute, { group_id: group_id });
    return await this.deleteRequest<void>(route);
  }

  public static async getImprovements(): Promise<Array<IImprovementsGroup>> {
    let route = this.buildRoute(this.improvementsRoute, {});
    return await this.getRequest<Array<IImprovementsGroup>>(route);
  }
}
