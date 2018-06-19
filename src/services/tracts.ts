import {
  Tract as ITract,
  NewTract as INewTract,
  Sale as ISale,
  File as IFile,
  FileInput as IFileInput,
  Improvement as IImprovement
} from '../types';
import BaseService from './baseService';

export interface IWorkfileNewTract extends INewTract {
  workfile_id: string | number;
}

export default class TractService extends BaseService {
  static workfileTractsRoute = SERVICES.WORKFILE_TRACTS;
  static workfileTractRoute = SERVICES.WORKFILE_TRACT;
  static tractFilesRoute = SERVICES.TRACT_FILES;
  static tractFileRoute = SERVICES.TRACT_FILE;
  static workfileTractsSummaryRoute = SERVICES.TRACTS_SUMMARY;
  static tractImprovementsRoute = SERVICES.TRACT_IMPROVEMENTS;
  static tractImprovementRoute = SERVICES.TRACT_IMPROVEMENT;

  static requestCache: Map<string, Array<ITract> | ITract> = new Map();
  static subscriptions: Map<string, Array<Function>> = new Map();

  public static async getTractsSummary(workfileId: string | number): Promise<ISale> {
    let route = this.buildRoute(this.workfileTractsSummaryRoute, { workfile_id: workfileId });
    return await this.getRequest<ISale>(route);
  }

  public static async getTracts(workfileId: string | number): Promise<Array<ITract>> {
    const route = this.buildRoute(this.workfileTractsRoute, {
      workfile_id: workfileId
    });

    try {
      return await this.getRequest<Array<ITract>>(route, true);
    } catch (e) {
      return [];
    }
  }

  public static subscribeToTractsForWorkfile(
    workfileId: string | number,
    subscriber: (tracts: Array<ITract>) => void
  ): () => void {
    const subscriptionRoute = this.buildRoute(this.workfileTractsRoute, {
      workfile_id: workfileId
    });
    const index = this.setSubscription(subscriptionRoute, subscriber);

    return () => this.clearSubscription(subscriptionRoute, index);
  }

  public static async getTract(
    workfileId: string | number,
    tractId: string | number
  ): Promise<ITract> {
    const route = this.buildRoute(this.workfileTractRoute, {
      workfile_id: workfileId,
      tract_id: tractId
    });

    const tract = await this.getRequest<ITract>(route, true);

    return tract;
  }

  public static async createTract(workfileId: string | number, tract: INewTract): Promise<ITract> {
    const tractRecord = {
      ...tract,
      workfile_id: workfileId
    };

    const route = this.buildRoute(this.workfileTractsRoute, { workfile_id: workfileId });

    const newTract = await this.postJSONRequest<IWorkfileNewTract, ITract>(route, tractRecord);

    const tractRoute = this.buildRoute(this.workfileTractRoute, {
      workfile_id: workfileId,
      tract_id: newTract.id
    });

    this.updateCacheRequest<Array<ITract>>(route, cache => [...cache, newTract], []);
    this.setCachedRequest<ITract>(tractRoute, newTract);

    this.broadcast(route);

    return newTract;
  }

  public static async updateTract(workfileId: string | number, tract: ITract): Promise<ITract> {
    const route = this.buildRoute(this.workfileTractRoute, {
      workfile_id: workfileId,
      tract_id: tract.id
    });

    const updatedTract = await this.putJSONRequest<ITract, ITract>(route, tract);

    this.updateCacheRequest<ITract>(route, () => updatedTract);

    const tractsForWorkfileRoute = this.buildRoute(this.workfileTractsRoute, {
      workfile_id: workfileId
    });

    if (this.getCachedRequest<Array<ITract>>(tractsForWorkfileRoute)) {
      this.updateCacheRequest<Array<ITract>>(tractsForWorkfileRoute, tracts => {
        return tracts.reduce((updatedTracts, t) => {
          if (t.id !== updatedTract.id) {
            return [...updatedTracts, t];
          }

          return [...updatedTracts, updatedTract];
        }, []);
      });
    }

    this.broadcast(route);
    this.broadcast(tractsForWorkfileRoute);

    return updatedTract;
  }

  public static async deleteTract(workfileId: string | number, tractId: number): Promise<ITract> {
    const route = this.buildRoute(this.workfileTractRoute, {
      workfile_id: workfileId,
      tract_id: tractId
    });

    const deletedTract = await this.deleteRequest<ITract>(route);

    const tractsForWorkfileRoute = this.buildRoute(this.workfileTractsRoute, {
      workfile_id: workfileId
    });

    if (this.getCachedRequest(tractsForWorkfileRoute)) {
      this.updateCacheRequest<Array<ITract>>(tractsForWorkfileRoute, tracts => {
        return tracts.filter(({ id }) => tractId !== id);
      });
    }

    this.deleteCacheRequest(route);

    this.broadcast(route);
    this.broadcast(tractsForWorkfileRoute);

    return deletedTract;
  }

  public static getTractImprovements(tract_id: number | string): Promise<Array<IImprovement>> {
    let route = this.buildRoute(this.tractImprovementsRoute, { tract_id: tract_id });
    return this.getRequest<Array<IImprovement>>(route);
  }

  public static createTractImprovement(
    tract_id: number | string,
    improvement: IImprovement
  ): Promise<IImprovement> {
    let route = this.buildRoute(this.tractImprovementsRoute, { tract_id: tract_id });
    return this.postJSONRequest<IImprovement, IImprovement>(route, improvement);
  }

  public static updateTractImprovement(
    tract_id: number | string,
    improvement_id: number | string,
    improvement: IImprovement
  ): Promise<IImprovement> {
    let route = this.buildRoute(this.tractImprovementRoute, {
      tract_id: tract_id,
      improvement_id: improvement_id
    });
    return this.putJSONRequest<IImprovement, IImprovement>(route, improvement);
  }

  public static deleteTractImprovement(
    tract_id: number | string,
    improvement_id: number | string
  ): Promise<void> {
    let route = this.buildRoute(this.tractImprovementRoute, { tract_id: tract_id });
    return this.deleteRequest<void>(route);
  }

  public static async getFiles(
    workfileId: string | number,
    tractId: string | number
  ): Promise<IFile[]> {
    const route = this.buildRoute(this.tractFilesRoute, {
      workfile_id: workfileId,
      tract_id: tractId
    });

    const files = await this.getRequest<IFile[]>(route);

    return files;
  }

  public static async createFile(
    workfileId: string | number,
    tractId: string | number,
    file: IFileInput
  ): Promise<IFile> {
    const route = this.buildRoute(this.tractFilesRoute, {
      workfile_id: workfileId,
      tract_id: tractId
    });

    return await this.postJSONRequest<IFileInput, IFile>(route, file);
  }
}
