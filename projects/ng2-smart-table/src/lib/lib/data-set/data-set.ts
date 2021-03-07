import {Row} from './row';
import {Column} from './column';
import {SmartTableNgColumns} from '../../ng2-smart-table.component';

export class DataSet<T extends object> {

  newRow: Row<Partial<T>>;

  protected data: Array<T> = [];
  protected columns: Column<T, unknown, keyof T>[] = [];
  protected rows: Array<Row<T>> = [];
  protected selectedRow: Row<T>;
  protected willSelect: string;

  constructor(data: T[] = [], protected columnSettings: SmartTableNgColumns<T>) {
    this.createColumns(columnSettings);
    this.setData(data);

    this.createNewRow();
  }

  setData(data: Array<T>) {
    this.data = data;
    this.createRows();
  }

  getColumns(): Array<Column<T, unknown, keyof T>> {
    return this.columns;
  }

  getRows(): Array<Row<T>> {
    return this.rows;
  }

  getFirstRow(): Row<T> {
    return this.rows[0];
  }

  getLastRow(): Row<T> {
    return this.rows[this.rows.length - 1];
  }

  findRowByData(data: T): Row<T> {
    return this.rows.find((row: Row<T>) => row.getData() === data);
  }

  deselectAll(): void {
    this.rows.forEach((row) => {
      row.isSelected = false;
    });
    // we need to clear selectedRow field because no one row selected
    this.selectedRow = undefined;
  }

  selectRow(row: Row<T>): Row<T> | undefined {
    const previousIsSelected = row.isSelected;
    this.deselectAll();

    row.isSelected = !previousIsSelected;
    this.selectedRow = row;

    return this.selectedRow;
  }

  multipleSelectRow(row: Row<T>): Row<T> {
    row.isSelected = !row.isSelected;
    this.selectedRow = row;

    return this.selectedRow;
  }

  selectPreviousRow(): Row<T> {
    if (this.rows.length > 0) {
      let index = this.selectedRow ? this.selectedRow.index : 0;
      if (index > this.rows.length - 1) {
        index = this.rows.length - 1;
      }
      this.selectRow(this.rows[index]);
      return this.selectedRow;
    }
  }

  selectFirstRow(): Row<T> | undefined {
    if (this.rows.length > 0) {
      this.selectRow(this.rows[0]);
      return this.selectedRow;
    }
  }

  selectLastRow(): Row<T> | undefined {
    if (this.rows.length > 0) {
      this.selectRow(this.rows[this.rows.length - 1]);
      return this.selectedRow;
    }
  }

  selectRowByIndex(index: number): Row<T> | undefined {
    const rowsLength: number = this.rows.length;
    if (rowsLength === 0) {
      return;
    }
    if (!index) {
      this.selectFirstRow();
      return this.selectedRow;
    }
    if (index > 0 && index < rowsLength) {
      this.selectRow(this.rows[index]);
      return this.selectedRow;
    }
    // we need to deselect all rows if we got an incorrect index
    this.deselectAll();
  }

  willSelectFirstRow(): void {
    this.willSelect = 'first';
  }

  willSelectLastRow(): void {
    this.willSelect = 'last';
  }

  select(selectedRowIndex?: number): Row<T> | undefined {
    if (this.getRows().length === 0) {
      return;
    }
    if (this.willSelect) {
      if (this.willSelect === 'first') {
        this.selectFirstRow();
      }
      if (this.willSelect === 'last') {
        this.selectLastRow();
      }
      this.willSelect = '';
    } else {
      this.selectRowByIndex(selectedRowIndex);
    }

    return this.selectedRow;
  }

  createNewRow(): void {
    // TODO this conversion might cause issues. need to re-evaluate
    this.newRow = new Row<Partial<T>>(-1, {}, this as unknown as DataSet<Partial<T>>);
    this.newRow.isInEditing = true;
  }

  /**
   * Create columns by mapping from the settings
   * @param settings
   * @private
   */
  createColumns(settings: SmartTableNgColumns<T>): void {
    for (const id in settings) {
      if (settings.hasOwnProperty(id)) {
        this.columns.push(new Column(id, settings[id], this));
      }
    }
  }

  /**
   * Create rows based on current data prepared in data source
   * @private
   */
  createRows(): void {
    this.rows = [];
    this.data.forEach((el, index) => {
      this.rows.push(new Row(index, el, this));
    });
  }
}
