import {Observable, Subject} from 'rxjs';
import {FilterConfigurationProperty, Pager, SortConfigurationProperty} from '../../ng2-smart-table.component';
import {FiltersConfiguration, PagingConfiguration} from './local/local.data-source';

export interface SourceChangeEvent<T extends object> {
  action: string;
  elements: T[];
  paging: PagingConfiguration;
  filter: FiltersConfiguration<T>;
  sort: SortConfigurationProperty<T, keyof T>[];
}

export abstract class DataSource<T extends object> {

  protected onChangedSource = new Subject<SourceChangeEvent<T>>();
  protected onAddedSource = new Subject<T>();
  protected onUpdatedSource = new Subject<T>();
  protected onRemovedSource = new Subject<T>();

  abstract getAll(): Promise<T[]>;
  abstract getElements(): Promise<T[]>;
  abstract getSort(): SortConfigurationProperty<T, keyof T>[];
  abstract getFilter(): FiltersConfiguration<T>;
  abstract getPaging(): Pager;
  abstract count(): number;

  refresh() {
    this.emitOnChanged('refresh');
  }

  load(data: Array<T>): Promise<void> {
    this.emitOnChanged('load');
    return Promise.resolve();
  }

  onChanged(): Observable<SourceChangeEvent<T>> {
    return this.onChangedSource.asObservable();
  }

  onAdded(): Observable<T> {
    return this.onAddedSource.asObservable();
  }

  onUpdated(): Observable<T> {
    return this.onUpdatedSource.asObservable();
  }

  onRemoved(): Observable<T> {
    return this.onRemovedSource.asObservable();
  }

  prepend(element: T): Promise<void> {
    this.emitOnAdded(element);
    this.emitOnChanged('prepend');
    return Promise.resolve();
  }

  append(element: T): Promise<void> {
    this.emitOnAdded(element);
    this.emitOnChanged('append');
    return Promise.resolve();
  }

  add(element: T): Promise<void> {
    this.emitOnAdded(element);
    this.emitOnChanged('add');
    return Promise.resolve();
  }

  remove(element: T): Promise<void> {
    this.emitOnRemoved(element);
    this.emitOnChanged('remove');
    return Promise.resolve();
  }

  update(element: T, values: Partial<T>): Promise<void> {
    this.emitOnUpdated(element);
    this.emitOnChanged('update');
    return Promise.resolve();
  }

  empty(): Promise<void> {
    this.emitOnChanged('empty');
    return Promise.resolve();
  }

  setSort<K extends keyof T>(conf: SortConfigurationProperty<T, K>[], doEmit?: boolean) {
    if (doEmit) {
      this.emitOnChanged('sort');
    }
  }

  setFilter<K extends keyof T>(conf: Array<FilterConfigurationProperty<T, K>>, andOperator?: boolean, doEmit?: boolean) {
    if (doEmit) {
      this.emitOnChanged('filter');
    }
  }

  addFilter<K extends keyof T>(fieldConf: FilterConfigurationProperty<T, K>, andOperator?: boolean, doEmit?: boolean) {
    if (doEmit) {
      this.emitOnChanged('filter');
    }
  }

  setPaging(page: number, pagingConf: {}, doEmit?: boolean): void {
    if (doEmit) {
      this.emitOnChanged('paging');
    }
  }

  setPage(page: number, doEmit?: boolean): void {
    if (doEmit) {
      this.emitOnChanged('page');
    }
  }

  protected emitOnRemoved(element: T): void {
    this.onRemovedSource.next(element);
  }

  protected emitOnUpdated(element: T): void {
    this.onUpdatedSource.next(element);
  }

  protected emitOnAdded(element: T) {
    this.onAddedSource.next(element);
  }

  protected emitOnChanged(action: string): void {
    this.getElements().then((elements) => this.onChangedSource.next({
      action,
      elements,
      paging: this.getPaging(),
      filter: this.getFilter(),
      sort: this.getSort(),
    }));
  }
}
