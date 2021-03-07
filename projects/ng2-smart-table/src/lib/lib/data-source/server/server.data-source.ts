import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';

import {LocalDataSource} from '../local/local.data-source';
import {ServerSourceConf} from './server-source.conf';
import {getDeepFromObject} from '../../helpers';

import {map} from 'rxjs/operators';
import {FilterConfigurationProperty} from '../../../ng2-smart-table.component';

export class ServerDataSource<T extends object> extends LocalDataSource<T> {

  protected conf: ServerSourceConf;

  protected lastRequestCount = 0;

  constructor(protected http: HttpClient, conf: ServerSourceConf | {} = {}) {
    super();

    this.conf = new ServerSourceConf(conf);

    if (!this.conf.endPoint) {
      throw new Error('At least endPoint must be specified as a configuration of the server data source.');
    }
  }

  count(): number {
    return this.lastRequestCount;
  }

  getElements(): Promise<T[]> {
    return this.requestElements()
      .pipe(map(res => {
        this.lastRequestCount = this.extractTotalFromResponse(res);
        this.data = this.extractDataFromResponse(res);

        return this.data;
      })).toPromise();
  }

  /**
   * Extracts array of data from server response
   */
  protected extractDataFromResponse(res: HttpResponse<T[]>): T[] {
    const rawData = res.body;
    const data = !!this.conf.dataKey ? getDeepFromObject(rawData, this.conf.dataKey, []) : rawData;

    if (data instanceof Array) {
      return data;
    }

    throw new Error(`Data must be an array.
    Please check that data extracted from the server response by the key '${this.conf.dataKey}' exists and is array.`);
  }

  /**
   * Extracts total rows count from the server response
   * Looks for the count in the heders first, then in the response body
   */
  protected extractTotalFromResponse(res: HttpResponse<T[]>): number {
    if (res.headers.has(this.conf.totalKey)) {
      return +res.headers.get(this.conf.totalKey);
    } else {
      const rawData = res.body;
      return getDeepFromObject(rawData, this.conf.totalKey, 0);
    }
  }

  protected requestElements(): Observable<HttpResponse<T[]>> {
    const httpParams = this.createRequesParams();
    return this.http.get<T[]>(this.conf.endPoint, { params: httpParams, observe: 'response' });
  }

  protected createRequesParams(): HttpParams {
    let httpParams = new HttpParams();

    httpParams = this.addSortRequestParams(httpParams);
    httpParams = this.addFilterRequestParams(httpParams);
    return this.addPagerRequestParams(httpParams);
  }

  protected addSortRequestParams(httpParams: HttpParams): HttpParams {
    if (this.sortConf) {
      this.sortConf.forEach((fieldConf) => {
        httpParams = httpParams.set(this.conf.sortFieldKey, String(fieldConf.field));
        httpParams = httpParams.set(this.conf.sortDirKey, fieldConf.direction.toUpperCase());
      });
    }

    return httpParams;
  }

  protected addFilterRequestParams(httpParams: HttpParams): HttpParams {

    if (this.filterConf.filters) {
      this.filterConf.filters.forEach((fieldConf: FilterConfigurationProperty<T, keyof T>) => {
        if (fieldConf.search) {
          httpParams = httpParams.set(this.conf.filterFieldKey.replace('#field#', String(fieldConf.field)), fieldConf.search);
        }
      });
    }

    return httpParams;
  }

  protected addPagerRequestParams(httpParams: HttpParams): HttpParams {

    if (this.pagingConf && this.pagingConf.page && this.pagingConf.perPage) {
      httpParams = httpParams.set(this.conf.pagerPageKey, String(this.pagingConf.page));
      httpParams = httpParams.set(this.conf.pagerLimitKey, String(this.pagingConf.perPage));
    }

    return httpParams;
  }
}
