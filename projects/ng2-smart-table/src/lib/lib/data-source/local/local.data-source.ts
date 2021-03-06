import {LocalSorter} from './local.sorter';
import {LocalFilter} from './local.filter';
import {LocalPager} from './local.pager';
import {DataSource} from '../data-source';
import {deepExtend} from '../../helpers';
import {FilterConfigurationProperty, Pager, SortConfigurationProperty} from '../../../ng2-smart-table.component';

export interface PagingConfiguration {
  page?: number;
  perPage?: number;
}
export interface FiltersConfiguration<T extends object> {
  filters: FilterConfigurationProperty<T, keyof T>[];
  andOperator: boolean;
}

export class LocalDataSource<T extends object> extends DataSource<T> {

  protected data: Array<T> = [];
  protected filteredAndSorted: Array<T> = [];
  protected sortConf: SortConfigurationProperty<T, keyof T>[] = [];
  protected filterConf: FiltersConfiguration<T> = {
    filters: [],
    andOperator: true,
  };
  protected pagingConf: PagingConfiguration = {};

  constructor(data: Array<T> = []) {
    super();
    this.data = data;
  }

  load(data: Array<T>): Promise<void> {
    this.data = data;

    return super.load(data);
  }

  prepend(element: T): Promise<void> {
    this.reset(true);

    this.data.unshift(element);
    return super.prepend(element);
  }

  append(element: T): Promise<void> {
    this.reset(true);

    this.data.push(element);
    return super.append(element);
  }

  add(element: T): Promise<void> {
    this.data.push(element);

    return super.add(element);
  }

  remove(element: T): Promise<void> {
    this.data = this.data.filter(el => el !== element);

    return super.remove(element);
  }

  update(element: T, values: Partial<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.find(element).then((found) => {
        found = deepExtend(found, values);
        super.update(found, values).then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  find(element: T): Promise<T> {
    const found = this.data.find(el => el === element);
    if (found) {
      return Promise.resolve(found);
    }

    return Promise.reject(new Error('Element was not found in the dataset'));
  }

  getElements(): Promise<T[]> {
    const data = this.data.slice(0);
    return Promise.resolve(this.prepareData(data));
  }

  getFilteredAndSorted(): Promise<T[]> {
    const data = this.data.slice(0);
    this.prepareData(data);
    return Promise.resolve(this.filteredAndSorted);
  }

  getAll(): Promise<T[]> {
    const data = this.data.slice(0);
    return Promise.resolve(data);
  }

  reset(silent = false) {
    if (silent) {
      this.filterConf = {
        filters: [],
        andOperator: true,
      };
      this.sortConf = [];
      this.pagingConf.page = 1;
    } else {
      this.setFilter([], true, false);
      this.setSort([], false);
      this.setPage(1);
    }
  }

  empty(): Promise<void> {
    this.data = [];

    return super.empty();
  }

  count(): number {
    return this.filteredAndSorted.length;
  }

  /**
   *
   * Array of conf objects
   * [
   *  {field: string, direction: asc|desc|null, compare: Function|null},
   * ]
   */
  setSort<K extends keyof T>(conf: SortConfigurationProperty<T, K>[], doEmit = true): LocalDataSource<T> {
    if (conf !== null) {

      conf.forEach((fieldConf) => {
        if (!fieldConf.field || typeof fieldConf.direction === 'undefined') {
          throw new Error('Sort configuration object is not valid');
        }
      });
      this.sortConf = conf;
    }

    super.setSort(conf, doEmit);
    return this;
  }

  clearFilters(): LocalDataSource<T> {
    return this.setFilter([]);
  }

  /**
   *
   * Array of conf objects
   * [
   *  {field: string, search: string, filter: Function|null},
   * ]
   */
  setFilter(conf: FilterConfigurationProperty<T, keyof T>[], andOperator = true, doEmit = true): LocalDataSource<T> {
    if (conf && conf.length > 0) {
      conf.forEach((fieldConf) => {
        this.addFilter(fieldConf, andOperator, false);
      });
    } else {
      this.filterConf = {
        filters: [],
        andOperator: true,
      };
    }
    this.filterConf.andOperator = andOperator;
    this.pagingConf.page = 1;

    super.setFilter(conf, andOperator, doEmit);
    return this;
  }

  addFilter<K extends keyof T>(fieldConf: FilterConfigurationProperty<T, K>,
                               andOperator = true, doEmit: boolean = true): LocalDataSource<T> {
    if (!fieldConf.field || typeof fieldConf.search === 'undefined') {
      throw new Error('Filter configuration object is not valid');
    }

    let found = false;
    this.filterConf.filters.forEach((currentFieldConf: FilterConfigurationProperty<T, K>, index: number) => {
      if (currentFieldConf.field === fieldConf.field) {
        this.filterConf.filters[index] = fieldConf;
        found = true;
      }
    });
    if (!found) {
      this.filterConf.filters.push(fieldConf);
    }
    this.filterConf.andOperator = andOperator;
    super.addFilter(fieldConf, andOperator, doEmit);
    return this;
  }

  setPaging(page: number, pagingConf: {}, doEmit: boolean = true): LocalDataSource<T> {
    this.pagingConf.page = page;
    super.setPaging(page, pagingConf, doEmit);

    return this;
  }

  setPage(page: number, doEmit: boolean = true): LocalDataSource<T> {
    this.pagingConf.page = page;
    super.setPage(page, doEmit);
    return this;
  }

  getSort(): SortConfigurationProperty<T, keyof T>[] {
    return this.sortConf;
  }

  getFilter(): FiltersConfiguration<T> {
    return this.filterConf;
  }

  getPaging(): Pager {
    return this.pagingConf;
  }

  protected prepareData(data: Array<T>): Array<T> {
    data = this.filter(data);
    data = this.sort(data);
    this.filteredAndSorted = data.slice(0);

    return this.paginate(data);
  }

  protected sort(data: T[]): T[] {
    if (this.sortConf) {
      this.sortConf.forEach((fieldConf) => {
        data = LocalSorter
          .sort<T>(data, fieldConf.field, fieldConf.direction, fieldConf.compare);
      });
    }
    return data;
  }

  // TODO: refactor?
  protected filter(data: T[]): T[] {
    if (this.filterConf.filters) {
      if (this.filterConf.andOperator) {
        this.filterConf.filters.forEach((fieldConf: FilterConfigurationProperty<T, keyof T>) => {
          if (fieldConf.search.length > 0) {
            data = LocalFilter
              .filter(data, fieldConf.field, fieldConf.search, fieldConf.filter);
          }
        });
      } else {
        let mergedData: T[] = [];
        this.filterConf.filters.forEach((fieldConf: FilterConfigurationProperty<T, keyof T>) => {
          if (fieldConf.search.length > 0) {
            mergedData = mergedData.concat(LocalFilter
              .filter(data, fieldConf.field, fieldConf.search, fieldConf.filter));
          }
        });
        // remove non unique items
        data = mergedData.filter((elem: T, pos: number, arr: T[]) => {
          return arr.indexOf(elem) === pos;
        });
      }
    }
    return data;
  }

  protected paginate(data: T[]): T[] {
    if (this.pagingConf && this.pagingConf.page && this.pagingConf.perPage) {
      data = LocalPager.paginate(data, this.pagingConf.page, this.pagingConf.perPage);
    }
    return data;
  }
}
