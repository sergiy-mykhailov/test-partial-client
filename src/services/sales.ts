import {
  Sale as ISale,
  NewSale as INewSale,
  SaleFilter as ISaleFilter,
  MinMax as IMinMax,
  File as IFile,
  FileInput as IFileInput,
  Improvement as IImprovement,
  CommonAttributes as ICommonAttributes
} from '../types';
import BaseService from './baseService';

export default class SaleService extends BaseService {
  static salesRoute = SERVICES.SALES;
  static saleRoute = SERVICES.SALE;
  static saleFilesRoute = SERVICES.SALE_FILES;
  static saleFileRoute = SERVICES.SALE_FILE;
  static salesImprovementsRoute = SERVICES.SALES_IMPROVEMENTS;
  static salesImprovementRoute = SERVICES.SALES_IMPROVEMENT;
  static saleImportRoute = SERVICES.SALE_IMPORT;
  static commonAttributesRoute = SERVICES.ATTRIBUTES;

  static requestCache: Map<string, Array<ISale> | ISale> = new Map();
  static subscriptions: Map<string, Array<Function>> = new Map();

  public static async getSales(filters?: ISaleFilter): Promise<Array<ISale>> {
    const query = filters ? this.buildFiltersQueryString(filters) : '';

    return await this.getRequest<Array<ISale>>(this.salesRoute + query, true);
  }

  public static async getSale(id: number): Promise<ISale> {
    return await this.getRequest<ISale>(this.buildRoute(this.saleRoute, { sale_id: id }), true);
  }

  public static subscribeToSales(subscriber: (tracts: Array<ISale>) => void): () => void {
    const subscriptionRoute = this.buildRoute(this.salesRoute, {});
    const index = this.setSubscription(subscriptionRoute, subscriber);

    return () => this.clearSubscription(subscriptionRoute, index);
  }

  public static async createSale(sale: INewSale): Promise<ISale> {
    let route = this.buildRoute(this.salesRoute, {});
    let newSale = await this.postJSONRequest<INewSale, ISale>(route, sale);
    let newRoute = this.buildRoute(this.saleRoute, { sale_id: newSale.id });

    this.updateCacheRequest<Array<ISale>>(route, cache => [...cache, newSale], []);
    this.setCachedRequest<ISale>(newRoute, newSale);

    this.broadcast(route);

    return newSale;
  }

  public static async updateSale(sale: ISale): Promise<ISale> {
    let route = this.buildRoute(this.saleRoute, { sale_id: sale.id });
    let updatedSale = await this.putJSONRequest<ISale, ISale>(route, sale);
    this.updateCacheRequest<ISale>(route, () => updatedSale);

    const salesRoute = this.buildRoute(this.salesRoute, {});

    if (this.getCachedRequest<Array<ISale>>(salesRoute)) {
      this.updateCacheRequest<Array<ISale>>(salesRoute, sales => {
        return sales.reduce((updatedSales, s) => {
          if (s.id !== updatedSale.id) {
            return [...updatedSales, s];
          }

          return [...updatedSales, updatedSale];
        }, []);
      });
    }

    this.broadcast(route);
    this.broadcast(salesRoute);

    return updatedSale;
  }

  public static async deleteSale(sale_id: number): Promise<void> {
    let route = this.buildRoute(this.saleRoute, { sale_id: sale_id });
    await this.deleteRequest<void>(route);

    const salesRoute = this.buildRoute(this.salesRoute, {});

    if (this.getCachedRequest(salesRoute)) {
      this.updateCacheRequest<Array<ISale>>(salesRoute, sales => {
        return sales.filter(({ id }) => sale_id !== id);
      });
    }

    this.deleteCacheRequest(route);

    this.broadcast(route);
    this.broadcast(salesRoute);
  }

  public static async getFiles(saleId: number): Promise<IFile[]> {
    const route = this.buildRoute(this.saleFilesRoute, {
      sale_id: saleId
    });

    const files = await this.getRequest<IFile[]>(route);

    return files;
  }

  public static async createFile(saleId: string | number, file: IFileInput): Promise<IFile> {
    const route = this.buildRoute(this.saleFilesRoute, {
      sale_id: saleId
    });

    return await this.postJSONRequest<IFileInput, IFile>(route, file);
  }

  public static buildFiltersQueryString(filters: ISaleFilter): string {
    const query = Object.keys(filters)
      .sort()
      .map(param => {
        let paramString = param + '=';

        switch (param) {
          case 'counties':
            if (!filters[param]) return '';
            return paramString + filters[param].join('');

          case 'cost':
          case 'acres':
            if (!filters[param]) return '';

            const min = filters[param].min;
            const max = filters[param].max;

            paramString = paramString + min;

            if (max && max > min) {
              paramString = paramString + ',' + max;
            }

            return paramString;

          case 'end_date':
          case 'start_date':
            if (!filters[param]) return '';

            return paramString + this.formatSaleDate(new Date(filters[param]));

          case 'search':
          case 'months_ago':
          case 'polygon':
          case 'workfile_id':
          case 'improvements':
          case 'highest_best_use':
          case 'land_use':
          case 'property_type':
          case 'category_type':
          case 'commodity_type':
            if (!filters[param]) return '';

            return paramString + filters[param];
        }
      })
      .filter(param => !!param);

    return query.length ? `?${query.join('&')}` : '';
  }

  public static formatSaleDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  public static async getSaleImprovements(sale_id: number | string): Promise<Array<IImprovement>> {
    let route = this.buildRoute(this.salesImprovementsRoute, {
      sale_id: sale_id
    });
    return this.getRequest<Array<IImprovement>>(route);
  }

  public static createSaleImprovement(
    sale_id: number | string,
    improvement: IImprovement
  ): Promise<IImprovement> {
    let route = this.buildRoute(this.salesImprovementsRoute, { sale_id: sale_id });
    return this.postJSONRequest<IImprovement, IImprovement>(route, improvement);
  }

  public static updateSaleImprovement(
    sale_id: number | string,
    improvement_id: number | string,
    improvement: IImprovement
  ): Promise<IImprovement> {
    let route = this.buildRoute(this.salesImprovementRoute, {
      sale_id: sale_id,
      improvement_id: improvement_id
    });
    return this.putJSONRequest<IImprovement, IImprovement>(route, improvement);
  }

  public static deleteSaleImprovement(
    sale_id: number | string,
    improvement_id: number | string
  ): Promise<void> {
    let route = this.buildRoute(this.salesImprovementRoute, {
      sale_id: sale_id,
      improvement_id: improvement_id
    });
    return this.deleteRequest<void>(route);
  }

  public static async importSale(file: FormData): Promise<any> {
    return await fetch(this.serviceUrl(this.saleImportRoute), {
      body: file,
      method: 'POST',
      headers: {
        ...this.authHeader()
      }
    });
  }

  public static async getCommonAttributes(): Promise<ICommonAttributes> {
    let route = this.buildRoute(this.commonAttributesRoute, {});
    return this.getRequest<ICommonAttributes>(route);
  }
}
