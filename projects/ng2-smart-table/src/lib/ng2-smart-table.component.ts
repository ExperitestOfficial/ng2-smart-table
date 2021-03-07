import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, Type} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {Grid} from './lib/grid';
import {DataSource} from './lib/data-source/data-source';
import {Row} from './lib/data-set/row';
import {deepExtend, getPageForRowIndex} from './lib/helpers';
import {LocalDataSource, PagingConfiguration} from './lib/data-source/local/local.data-source';
import {CompleterData} from 'ng2-completer';
import {Ng2CustomComponent} from './components/filter/custom-filter.component';
import {SortDirection} from './lib/data-set/column';

/**
 * Settings for the table column with actions buttons
 */
export interface SmartTableNgAction {
  edit?: boolean;
  position?: 'right' | 'left';
  columnTitle?: string;
  custom?: CustomST2Button[];
  add?: boolean;
  delete?: boolean;
}
/**
 * Interface for custom action button.
 * 'name' - describes the button action
 * 'title' - text inside button
 */
export interface CustomST2Button {
  name: string;
  title: string;
}

export interface SmartTableEventRow<T extends object> {
  confirm?: any;
  data: T;
  newData?: T;
  isSelected?: boolean;
  source: DataSource<T>;
  selected?: T[];
}

export interface Pager extends PagingConfiguration {
  display?: boolean;
  showPagesCount?: number;
  styleClasses?: string;
}
export interface SmartTableNg2Setting<T extends object> {
  pager?: Pager;
  mode?: 'inline' | 'external' | 'click-to-edit';
  selectMode?: string;
  noDataMessage?: string;
  filter?: {
    inputClass: string;
  };
  attr?: {
    class?: string;
    id?: string,
  };
  switchPageToSelectedRowPage?: boolean;
  hideHeader?: boolean;
  hideSubHeader?: boolean;
  actions?: SmartTableNgAction | boolean;
  columns?: SmartTableNgColumns<T>;
  rowClassFunction?: (row: SmartTableEventRow<T>) => string;
  edit?: {
    inputClass?: string;
    confirmSave: boolean;
    editButtonContent?: string;
    saveButtonContent?: string,
    cancelButtonContent?: string,
  };
  add?: {
    inputClass?: string,
    addButtonContent?: string,
    createButtonContent?: string,
    cancelButtonContent?: string,
    confirmCreate: boolean,
  };
  delete?: {
    confirmDelete: boolean;
    deleteButtonContent?: string;
  };
  selectedRowIndex?: number;
}
export type ColumnType = 'html' | 'custom' | '' | 'text' | 'string';
export type SmartTableNgColumns<T extends object> = {
  [key in keyof T]?: SmartTableNgColumn<T, unknown, key>;
};
export interface SmartTableNgColumn<T extends object, D, K extends keyof T> {
  addable?: boolean;
  editable?: boolean;
  title: string;
  filter?: false | SmartTableColumnConfig; // TODO true might be required
  type?: ColumnType;
  width?: string;
  valuePrepareFunction?:
    (cell: string | number | boolean, rowData?: T, cellData?: SmartTableNgCellData) => D;
  class?: string;
  renderComponent?: Type<unknown>; // Don't do it specific type since it's serving as component which is function
  hide?: boolean;
  filterFunction?: (value: T[K], search: string) => boolean;
  onComponentInitFunction?: (instance: Ng2CustomComponent<T, K>) => void;
  editor?: SmartTableNgEditor;
  sort?: false | SortDirection;
  compareFunction?: (direction: number, firstElem: T[K], secondElem: T[K]) => number;
  sortDirection?: SortDirection;
}

export interface SmartTableNgEditor extends SmartTableColumnConfig {
  type: 'text' | 'textarea' | 'completer' | 'list' | 'checkbox' | 'custom' | '';
}

export interface SmartTableColumnConfig {
  type: string;
  config?: {
    resetText?: string;
    selectText?: string;
    true?: string,
    false?: string,
    unique?: boolean,
    list?: {value: string | number | boolean, title: string}[],
    completer?: {
      data?: unknown[] | Observable<unknown>,
      searchFields?: string;
      descriptionField?: string;
      titleField?: string;
      pause?: number,
      placeholder?: string,
      dataService?: CompleterData & {descriptionField: (field: string) => void},
      minSearchLength?: number
    }
  };
  component?: Type<unknown>;
}

export interface SmartTableNgCellData {
  column: {
    id: string; // The name of the column unique id
  };
  rowIdentifier?: RowId;
  value: string | number | boolean;
}

export type RowId = number | string | boolean;

export function isRowId(o: any): o is RowId {
  return typeof o === 'number' || typeof o === 'string' || typeof o === 'boolean';
}

export interface SortConfigurationProperty<T extends object, K extends keyof T> extends ConfigurationProperty<T, K> {
  direction?: 'desc' | 'asc' | '';
  compare?: (direction: 1 | -1, value1: any, value2: any) => number;
}

export interface ConfigurationProperty<T extends object, K extends keyof T> {
  field?: K;
}

export interface FilterConfigurationProperty<T extends object, K extends keyof T> extends ConfigurationProperty<T, K> {
  search?: string;
  filter?: (value: T[K], search: string) => boolean;
}

@Component({
  selector: 'ng2-smart-table',
  styleUrls: ['./ng2-smart-table.component.scss'],
  templateUrl: './ng2-smart-table.component.html',
})
export class Ng2SmartTableComponent<T extends object> implements  OnInit, OnChanges, OnDestroy {


  @Input() source: DataSource<T> | T[];
  /**
   * selectedRowIndex we always initialize data with -1 this condition won't select first row automaticaly
   */
  @Input() settings: SmartTableNg2Setting<T> = {};
  @Input() debug = false;
  @Output() rowSelect = new EventEmitter<SmartTableEventRow<T>>();
  @Output() rowDeselect = new EventEmitter<SmartTableEventRow<T>>();
  @Output() userRowSelect = new EventEmitter<SmartTableEventRow<T>>();
  @Output() delete = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();
  @Output() custom = new EventEmitter<any>();
  @Output() deleteConfirm = new EventEmitter<any>();
  @Output() editConfirm = new EventEmitter<any>();
  @Output() createConfirm = new EventEmitter<any>();
  @Output() rowHover: EventEmitter<any> = new EventEmitter<any>();

  public dataSource: DataSource<T>;
  tableClass: string;
  tableId: string;
  perPageSelect: any;
  isHideHeader: boolean;
  isHideSubHeader: boolean;
  isPagerDisplay: boolean;
  rowClassFunction: (row: SmartTableEventRow<T>) => string;

  grid: Grid<T>;
  // those are the default setting of the table setting.
  defaultSettings: SmartTableNg2Setting<T> = {
    mode: 'inline', // inline|external|click-to-edit
    selectMode: 'single', // single|multi
    /**
     * Points to an element in all data
     *
     * when < 0 all lines must be deselected
     */
    selectedRowIndex: -1,
    switchPageToSelectedRowPage: false,
    hideHeader: false,
    hideSubHeader: false,
    actions: {
      columnTitle: 'Actions',
      add: true,
      edit: true,
      delete: true,
      custom: [],
      position: 'left', // left|right
    },
    filter: {
      inputClass: '',
    },
    edit: {
      inputClass: '',
      editButtonContent: 'Edit',
      saveButtonContent: 'Save',
      cancelButtonContent: 'Cancel',
      confirmSave: false,
    },
    add: {
      inputClass: '',
      addButtonContent: 'Add New',
      createButtonContent: 'Create',
      cancelButtonContent: 'Cancel',
      confirmCreate: false,
    },
    delete: {
      deleteButtonContent: 'Delete',
      confirmDelete: false,
    },
    attr: {
      id: '',
      class: '',
    },
    noDataMessage: 'No data found',
    columns: {},
    pager: {
      display: true,
      page: 1,
      perPage: 10,
      showPagesCount: 4,
      styleClasses: ''


    },
    rowClassFunction: () => '',
  };

  isAllSelected = false;

  private onSelectRowSubscription: Subscription;
  private onDeselectRowSubscription: Subscription;
  private destroyed$: Subject<void> = new Subject<void>();

  ngOnInit() {
    if (this.debug) {
      // We can add here needed data like version (from package.json) or some other needed things. But it can produce problems in compiling.
      // TODO - add version from lib.package.json
      console.log('NG2-SmartTable');
    }
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    if (this.grid) {
      if (changes.settings) {
        this.grid.setSettings(this.prepareSettings());
      }
      if (changes.source) {
        this.dataSource = this.prepareSource();
        this.grid.setSource(this.dataSource);
      }
    } else {
      this.initGrid();
    }
    this.tableId = this.grid.getSetting('attr.id');
    this.tableClass = this.grid.getSetting('attr.class');
    this.isHideHeader = this.grid.getSetting('hideHeader');
    this.isHideSubHeader = this.grid.getSetting('hideSubHeader');
    this.isPagerDisplay = this.grid.getSetting('pager.display');
    this.perPageSelect = this.grid.getSetting('pager.perPageSelect');
    this.rowClassFunction = this.grid.getSetting('rowClassFunction');
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  // noinspection JSUnusedGlobalSymbols
  selectRow(index: number, switchPageToSelectedRowPage: boolean = this.grid.getSetting('switchPageToSelectedRowPage')): void {
    if (!this.grid) {
      return;
    }
    this.grid.settings.selectedRowIndex = index;
    if (this.isIndexOutOfRange(index)) {
      // we need to deselect all rows if we got an incorrect index
      this.deselectAllRows();
      return;
    }

    if (switchPageToSelectedRowPage) {
      const source: DataSource<T> = this.dataSource;
      const paging: PagingConfiguration = source.getPaging();
      const page: number = getPageForRowIndex(index, paging.perPage);
      index = index % paging.perPage;
      this.grid.settings.selectedRowIndex = index;

      if (page !== paging.page) {
        source.setPage(page);
        return;
      }

    }

    const row: Row<T> = this.grid.getRows()[index];
    if (row) {
      this.onSelectRow(row);
    } else {
      // we need to deselect all rows if we got an incorrect index
      this.deselectAllRows();
    }
  }

  private deselectAllRows(): void {
    this.grid.dataSet.deselectAll();
    this.emitDeselectRow(null);
  }

  editRowSelect(row: Row<T>) {
    if (this.grid.getSetting('selectMode') === 'multi') {
      this.onMultipleSelectRow(row);
    } else {
      this.onSelectRow(row);
    }
  }

  onUserSelectRow(row: Row<T>) {
    if (this.grid.getSetting('selectMode') === 'multi') {
      this.grid.getSelectedRows().filter(other => other !== row && other.isSelected).forEach(other => {
        other.isSelected = false;
        this.emitUserSelectRow(other);
        this.emitSelectRow(other);
      });
      this.multipleSelectRow(row);
    } else {
      this.grid.selectRow(row);
      this.emitUserSelectRow(row);
      this.emitSelectRow(row);
    }
  }

  onRowHover(row: Row<T>) {
    this.rowHover.emit(row);
  }

  multipleSelectRow(row: Row<T>) {
    const initialAllSelected = this.isAllSelected;
    this.isAllSelected =
      this.grid.getSelectedRows().length === this.grid.getRows().length - 1 &&
      !this.grid.getSelectedRows().includes(row);
    this.grid.multipleSelectRow(row);
    if (initialAllSelected !== this.isAllSelected && this.isAllSelected) {
      row = null;
    }
    this.emitUserSelectRow(row);
    this.emitSelectRow(row);
  }

  onSelectAllRows(): void {
    this.isAllSelected = !this.isAllSelected;
    this.grid.selectAllRows(this.isAllSelected);

    this.emitUserSelectRow(null);
    this.emitSelectRow(null);
  }

  onSelectRow(row: Row<T>) {
    this.grid.selectRow(row);
    this.emitSelectRow(row);
  }

  onMultipleSelectRow(row: Row<T>) {
    this.emitSelectRow(row);
  }

  initGrid(): void {
    this.dataSource = this.prepareSource();
    this.grid = new Grid(this.dataSource, this.prepareSettings());

    this.subscribeToOnSelectRow();
    this.subscribeToOnDeselectRow();
  }

  prepareSource(): DataSource<T> {
    if (this.source instanceof DataSource) {
      return this.source;
    } else if (this.source instanceof Array) {
      return new LocalDataSource(this.source);
    }

    return new LocalDataSource();
  }

  prepareSettings(): SmartTableNg2Setting<T> {
    return deepExtend({}, this.defaultSettings, this.settings);
  }

  changePage(pageNumber: {page: number}): void {
    this.resetAllSelector();
  }

  sort(): void {
    // this.resetAllSelector();
  }

  filter($event: any): void {
    this.resetAllSelector();
  }

  private resetAllSelector(): void {
    this.isAllSelected = false;
  }

  private emitUserSelectRow(row: Row<T>): void {
    const selectedRows = this.grid.getSelectedRows();

    this.userRowSelect.emit({
      data: row ? row.getData() : null,
      isSelected: row ? row.getIsSelected() : null,
      source: this.dataSource,
      selected: selectedRows && selectedRows.length ? selectedRows.map((r: Row<T>) => r.getData()) : [],
    });
  }

  private emitSelectRow(row: Row<T>): void {
    const data = {
      data: row ? row.getData() : null,
      isSelected: row ? row.getIsSelected() : null,
      source: this.dataSource,
    };
    this.rowSelect.emit(data);
    if (!row?.isSelected) {
      this.rowDeselect.emit(data);
    }
  }

  private emitDeselectRow(row: Row<T>): void {
    this.rowDeselect.emit({
      data: row ? row.getData() : null,
      isSelected: row ? row.getIsSelected() : null,
      source: this.dataSource,
    });
  }

  private isIndexOutOfRange(index: number): boolean {
    const dataAmount: number = this.dataSource?.count();
    return index < 0 || (typeof dataAmount === 'number' && index >= dataAmount);
  }

  private subscribeToOnSelectRow(): void {
    if (this.onSelectRowSubscription) {
      this.onSelectRowSubscription.unsubscribe();
    }
    this.onSelectRowSubscription = this.grid.onSelectRow()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((row) => {
        this.emitSelectRow(row);
      });
  }

  private subscribeToOnDeselectRow(): void {
    if (this.onDeselectRowSubscription) {
      this.onDeselectRowSubscription.unsubscribe();
    }
    this.onDeselectRowSubscription = this.grid.onDeselectRow()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((row) => {
        this.emitDeselectRow(row);
      });
  }
}
