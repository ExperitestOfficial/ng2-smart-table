import { Cell } from './cell';
import { Column } from './column';
import { DataSet } from './data-set';

export class Row<T extends object> {

  isSelected = false;
  isInEditing = false;
  cells: Cell<T, unknown, keyof T>[] = [];


  constructor(public index: number, protected data: T, protected dataSet: DataSet<T>) {
    this.process();
  }

  getCell<K extends keyof T>(column: Column<T, unknown, K>): Cell<T, unknown, keyof T> {
    return this.cells.find(el => el.getColumn() === column);
  }

  getCells() {
    return this.cells;
  }

  getData(): T {
    return this.data;
  }

  getIsSelected(): boolean {
    return this.isSelected;
  }

  getNewData(): Partial<T> {
    const values = Object.assign({}, this.data);
    this.getCells().forEach((cell) => values[cell.getColumn().id] = cell.newValue);
    return values;
  }

  setData(data: T): void {
    this.data = data;
    this.process();
  }

  process(): void {
    this.cells = [];
    this.dataSet.getColumns().forEach(<K extends keyof T, D>(column: Column<T, D, K>) => {
      const cell = this.createCell(column);
      this.cells.push(cell);
    });
  }

  createCell<K extends keyof T>(column: Column<T, unknown, K>): Cell<T, unknown, keyof T> {
    const defValue = (column as any).settings.defaultValue ? (column as any).settings.defaultValue : '';
    const value = typeof this.data[column.id] === 'undefined' ? defValue : this.data[column.id];
    return new Cell(value, this, column, this.dataSet);
  }
}
