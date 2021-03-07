import {DataSet} from './data-set';
import {
  ColumnType,
  SmartTableColumnConfig,
  SmartTableNgCellData, SmartTableNgColumn, SmartTableNgEditor,
} from '../../../lib/ng2-smart-table.component';
import {Type} from '@angular/core';
import {Ng2CustomComponent} from '../../components/filter/custom-filter.component';

export type SortDirection = 'asc' | 'desc' | '';

export class Column<T extends object, D, K extends keyof T> implements SmartTableNgColumn<T, D, K> {

  title = '';
  type: ColumnType = '';
  class = '';
  width = '';
  hide = false;
  isSortable = false;
  isEditable = true;
  isAddable = true;
  isFilterable = false;
  sortDirection: SortDirection = '';
  defaultSortDirection: SortDirection = '';
  editor: SmartTableNgEditor = { type: '', config: {}, component: null };
  filter: false | SmartTableColumnConfig = { type: '', config: {}, component: null };
  renderComponent: Type<unknown> = null;
  compareFunction: (direction: 1 | -1, value1: any, value2: any) => number;
  valuePrepareFunction: (cell: string | number | boolean, rowData?: T, cellData?: SmartTableNgCellData) => D;
  filterFunction: (value: T[K], search: string) => boolean;
  onComponentInitFunction: (instance: Ng2CustomComponent<T, K>) => void;

  constructor(public id: keyof T, protected settings: SmartTableNgColumn<T, D, K>, protected dataSet: DataSet<T>) {
    this.process();
  }

  getOnComponentInitFunction(): (instance: Ng2CustomComponent<T, K>) => void {
    return this.onComponentInitFunction;
  }

  getCompareFunction(): (direction: 1 | -1, value1: any, value2: any) => number {
    return this.compareFunction;
  }

  getValuePrepareFunction(): (cell: string | number | boolean, rowData?: T, cellData?: SmartTableNgCellData) => D {
    return this.valuePrepareFunction;
  }

  getFilterFunction(): (value: T[K], search: string) => boolean {
    return this.filterFunction;
  }

  getConfig(): SmartTableColumnConfig['config'] {
    return this.editor && this.editor.config;
  }

  getFilterType(): string | null | undefined | false {
    return this.filter && this.filter.type;
  }

  getFilterConfig(): SmartTableColumnConfig['config'] {
    return this.filter && this.filter.config;
  }

  protected process(): void {
    this.title = this.settings.title;
    this.class = this.settings.class;
    this.width = this.settings.width;
    this.hide = !!this.settings.hide;
    this.type = this.prepareType();
    this.editor = this.settings.editor;
    this.filter = this.settings.filter;
    this.renderComponent = this.settings.renderComponent;

    this.isFilterable = typeof this.settings.filter === 'undefined' ? true : !!this.settings.filter;
    this.defaultSortDirection = ['asc', 'desc']
      .indexOf(this.settings.sortDirection) !== -1 ? this.settings.sortDirection : '';
    this.isSortable = typeof this.settings.sort === 'undefined' ? true : !!this.settings.sort;
    this.isEditable = typeof this.settings.editable === 'undefined' ? true : !!this.settings.editable;
    this.isAddable = typeof this.settings.addable === 'undefined' ? true : !!this.settings.addable;
    this.sortDirection = this.prepareSortDirection();

    this.compareFunction = this.settings.compareFunction;
    this.valuePrepareFunction = this.settings.valuePrepareFunction;
    this.filterFunction = this.settings.filterFunction;
    this.onComponentInitFunction = this.settings.onComponentInitFunction;
  }

  prepareType(): ColumnType {
    return this.settings.type || this.determineType();
  }

  prepareSortDirection(): SortDirection {
    return this.settings.sort === 'desc' ? 'desc' : 'asc';
  }

  determineType(): ColumnType {
    // TODO: determine type by data
    return 'text';
  }
}
