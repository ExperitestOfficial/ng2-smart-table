import {Observable, Subject, Subscription} from 'rxjs';
import {EventEmitter} from '@angular/core';

import {Deferred, getDeepFromObject, getPageForRowIndex} from './helpers';
import {Column} from './data-set/column';
import {Row} from './data-set/row';
import {DataSet} from './data-set/data-set';
import {DataSource, SourceChangeEvent} from './data-source/data-source';
import {SmartTableNg2Setting, SortConfigurationProperty} from '../ng2-smart-table.component';

export interface ConfirmResponse<T extends object> {
  data?: T;
  newData?: Partial<T>;
  source: DataSource<T>;
  confirm: Deferred;
}

export class Grid<T extends object> {

  createFormShown = false;

  source: DataSource<T>;
  settings: SmartTableNg2Setting<T>;
  dataSet: DataSet<T>;

  onSelectRowSource = new Subject<Row<T>>();
  onDeselectRowSource = new Subject<Row<T>>();

  private sourceOnChangedSubscription: Subscription;
  private sourceOnUpdatedSubscription: Subscription;

  constructor(source: DataSource<T>, settings: SmartTableNg2Setting<T>) {
    this.setSettings(settings);
    this.setSource(source);
  }

  detach(): void {
    if (this.sourceOnChangedSubscription) {
      this.sourceOnChangedSubscription.unsubscribe();
    }
    if (this.sourceOnUpdatedSubscription) {
      this.sourceOnUpdatedSubscription.unsubscribe();
    }
  }

  showActionColumn(position: string): boolean {
    return this.isCurrentActionsPosition(position) && this.isActionsVisible();
  }

  isCurrentActionsPosition(position: string): boolean {
    return position === this.getSetting('actions.position');
  }

  isActionsVisible(): boolean {
    return this.getSetting('actions.add') || this.getSetting('actions.edit') || this.getSetting('actions.delete') || this.getSetting('actions.custom').length;
  }

  isMultiSelectVisible(): boolean {
    return this.getSetting('selectMode') === 'multi';
  }

  getNewRow(): Row<Partial<T>> {
    return this.dataSet.newRow as Row<Partial<T>>;
  }

  setSettings(settings: SmartTableNg2Setting<T>) {
    this.settings = settings;
    this.dataSet = new DataSet([], this.getSetting('columns'));

    if (this.source) {
      this.source.refresh();
    }
  }

  getDataSet(): DataSet<T> {
    return this.dataSet;
  }

  setSource(source: DataSource<T>): void {
    this.source = this.prepareSource(source);
    this.detach();

    this.sourceOnChangedSubscription = this.source.onChanged()
      .subscribe((changes: SourceChangeEvent<T>) => this.processDataChange(changes));

    this.sourceOnUpdatedSubscription = this.source.onUpdated().subscribe((data: T) => {
      const changedRow = this.dataSet.findRowByData(data);
      changedRow.setData(data);
    });
  }

  getSetting(name: string, defaultValue?: any): any {
    return getDeepFromObject(this.settings, name, defaultValue);
  }

  getColumns(): Array<Column<T, unknown, keyof T>> {
    return this.dataSet.getColumns();
  }

  getRows(): Array<Row<T>> {
    return this.dataSet.getRows();
  }

  selectRow(row: Row<T>) {
    this.dataSet.selectRow(row);
  }

  multipleSelectRow(row: Row<T>) {
    this.dataSet.multipleSelectRow(row);
  }

  onSelectRow(): Observable<Row<T>> {
    return this.onSelectRowSource.asObservable();
  }

  onDeselectRow(): Observable<Row<T>> {
    return this.onDeselectRowSource.asObservable();
  }

  edit(row: Row<T>) {
    row.isInEditing = true;
  }

  create(row: Row<Partial<T>>, confirmEmitter: EventEmitter<ConfirmResponse<T>>) {

    const deferred = new Deferred();
    deferred.promise.then((newData) => {
      newData = newData ? newData : row.getNewData();
      if (deferred.resolve.skipAdd) {
        this.createFormShown = false;
      } else {
        this.source.prepend(newData).then(() => {
          this.createFormShown = false;
          this.dataSet.createNewRow();
        });
      }
    }).catch(() => {
      // doing nothing
    });

    if (this.getSetting('add.confirmCreate')) {
      confirmEmitter.emit({
        newData: row.getNewData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  save(row: Row<T>, confirmEmitter: EventEmitter<ConfirmResponse<T>>) {

    const deferred = new Deferred();
    deferred.promise.then((newData) => {
      newData = newData ? newData : row.getNewData();
      if (deferred.resolve.skipEdit) {
        row.isInEditing = false;
      } else {
        this.source.update(row.getData(), newData).then(() => {
          row.isInEditing = false;
        });
      }
    }).catch(() => {
      // doing nothing
    });

    if (this.getSetting('edit.confirmSave')) {
      confirmEmitter.emit({
        data: row.getData(),
        newData: row.getNewData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  delete(row: Row<T>, confirmEmitter: EventEmitter<ConfirmResponse<T>>): void {

    const deferred = new Deferred();
    deferred.promise.then(() => {
      this.source.remove(row.getData());
    }).catch(() => {
      // doing nothing
    });

    if (this.getSetting('delete.confirmDelete')) {
      confirmEmitter.emit({
        data: row.getData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  processDataChange(changes: SourceChangeEvent<T>): void {
    let rowsDataIDs;
    const selectedRowsData = this.getSelectedRows().map(row => row.getData());
    const idProp = 'id';
    if (selectedRowsData.every(data => data?.hasOwnProperty(idProp))) {
      rowsDataIDs = selectedRowsData.map(data => data[idProp]);
    }
    if (this.shouldProcessChange(changes)) {
      this.dataSet.setData(changes.elements);
      if (this.getSetting('selectMode') !== 'multi') {
        const row = this.determineRowToSelect(changes);
        if (row) {
          this.onSelectRowSource.next(row);
        } else {
          this.onDeselectRowSource.next(null);
        }
      }
      if (rowsDataIDs){
        rowsDataIDs.forEach(rowId => {
          const currentRow = this.getRows().find(row => row.getData()[idProp] === rowId);
          if (currentRow) {
            this.multipleSelectRow(currentRow);
          }
        });
      }
    }
  }

  shouldProcessChange(changes: SourceChangeEvent<T>): boolean {
    if (['filter', 'sort', 'page', 'remove', 'refresh', 'load', 'paging'].indexOf(changes.action) !== -1) {
      return true;
    } else if (['prepend', 'append'].indexOf(changes.action) !== -1 && !this.getSetting('pager.display')) {
      return true;
    }

    return false;
  }

  /**
   * @breaking-change 1.8.0
   * Need to add `| null` in return type
   *
   * TODO: move to selectable? Separate directive
   */
  determineRowToSelect(changes: SourceChangeEvent<T>): Row<T> {

    if (['load', 'page', 'filter', 'sort', 'refresh'].indexOf(changes.action) !== -1) {
      return this.dataSet.select(this.getRowIndexToSelect());
    }
    // since we always initialize data with -1 this condition is always true
    if (this.shouldSkipSelection()) {
      return null;
    }

    if (changes.action === 'remove') {
      if (changes.elements.length === 0) {
        // we have to store which one to select as the data will be reloaded
        this.dataSet.willSelectLastRow();
      } else {
        return this.dataSet.selectPreviousRow();
      }
    }
    if (changes.action === 'append') {
      // we have to store which one to select as the data will be reloaded
      this.dataSet.willSelectLastRow();
    }
    if (changes.action === 'add') {
      return this.dataSet.selectFirstRow();
    }
    if (changes.action === 'update') {
      return this.dataSet.selectFirstRow();
    }
    if (changes.action === 'prepend') {
      // we have to store which one to select as the data will be reloaded
      this.dataSet.willSelectFirstRow();
    }
    return null;
  }

  prepareSource(source: DataSource<T>): DataSource<T> {
    const initialSource = this.getInitialSort();
    let pagingConf = {};
    if (initialSource && initialSource.field && initialSource.direction) {
      source.setSort([initialSource], false);
    }
    if (this.getSetting('pager.display') === true) {
      pagingConf = {
        page: 1,
        display: true,
        perPage: this.getSetting('pager.perPage'),
        showPagesCount: this.getSetting('pager.showPagesCount'),
        styleClasses: this.getSetting('pager.styleClasses')
      };
      source.setPaging(this.getPageToSelect(source), pagingConf, false);

    }

    source.refresh();
    return source;
  }

  getInitialSort(): SortConfigurationProperty<T, keyof T> {
    const sortConf: SortConfigurationProperty<T, keyof T> = {};
    this.getColumns().forEach((column: Column<T, unknown, keyof T>) => {
      if (column.isSortable && column.defaultSortDirection) {
        sortConf.field = column.id;
        sortConf.direction = column.defaultSortDirection;
        sortConf.compare = column.getCompareFunction();
      }
    });
    return sortConf;
  }

  getSelectedRows(): Array<Row<T>> {
    return this.dataSet.getRows()
      .filter(r => r.isSelected);
  }

  selectAllRows(status: boolean): void {
    this.dataSet.getRows()
      .forEach((r: Row<T>) => r.isSelected = status);
  }

  getFirstRow(): Row<T> {
    return this.dataSet.getFirstRow();
  }

  getLastRow(): Row<T> {
    return this.dataSet.getLastRow();
  }

  private getSelectionInfo(): { perPage: number, page: number, selectedRowIndex: number, switchPageToSelectedRowPage: boolean } {
    const switchPageToSelectedRowPage: boolean = this.getSetting('switchPageToSelectedRowPage');
    /**
     * In default logic we passed selectedRowIndex: -1 in settings
     * if we set here -1 we shouldn't do it and table won't select row.
     */
    const selectedRowIndex: number = Number(this.getSetting('selectedRowIndex', -1)) || -1;
    const { perPage, page }: { perPage: number, page: number } = this.getSetting('pager');
    return { perPage, page, selectedRowIndex, switchPageToSelectedRowPage };
  }

  private getRowIndexToSelect(): number {
    const { switchPageToSelectedRowPage, selectedRowIndex, perPage } = this.getSelectionInfo();
    const dataAmount: number = this.source.count();
    /**
     * source - contains all table data
     * dataSet - contains data for current page
     * selectedRowIndex - contains index for data in all data
     *
     * because of that, we need to count index for a specific row in page
     * if
     * `switchPageToSelectedRowPage` - we need to change page automatically
     * `selectedRowIndex < dataAmount && selectedRowIndex >= 0` - index points to existing data
     * (if index points to non-existing data and we calculate index for current page - we will get wrong selected row.
     *  if we return index witch not points to existing data - no line will be highlighted)
     */
    return (
      switchPageToSelectedRowPage &&
      selectedRowIndex < dataAmount &&
      selectedRowIndex >= 0
    ) ?
      selectedRowIndex % perPage :
      selectedRowIndex;
  }

  private getPageToSelect(source: DataSource<T>): number {
    const { switchPageToSelectedRowPage, selectedRowIndex, perPage, page } = this.getSelectionInfo();
    let pageToSelect: number = Math.max(1, page);
    if (switchPageToSelectedRowPage && selectedRowIndex >= 0) {
      pageToSelect = getPageForRowIndex(selectedRowIndex, perPage);
    }
    const maxPageAmount: number = Math.ceil(source.count() / perPage);
    return maxPageAmount ? Math.min(pageToSelect, maxPageAmount) : pageToSelect;
  }

  private shouldSkipSelection(): boolean {
    /**
     * For backward compatibility when using `selectedRowIndex` with non-number values - ignored.
     *
     * Therefore, in order to select a row after some changes,
     * the `selectedRowIndex` value must be invalid or >= 0 (< 0 means that no row is selected).
     *
     * `Number(value)` returns `NaN` on all invalid cases, and comparisons with `NaN` always return `false`.
     *
     * !!! We should skip a row only in cases when `selectedRowIndex` < 0
     * because when < 0 all lines must be deselected
     */
    // const selectedRowIndex = Number(this.getSetting('selectedRowIndex'));
    const selectedRowIndex = -1;
    return selectedRowIndex < 0;
  }
}
