import {Component, OnInit} from '@angular/core';
import {LocalDataSource} from 'ng2-smart-table';
import {St2CellDataComponent} from './st2-cell-data.component.';

interface ExampleData {
  name: string;
  myNumber: number;
  myBoolean: boolean;
  myCustom: string;
}

/**
 * The functionality is naive since it's only for testing purpose
 */
@Component({
  selector: 'app-multiple-items-demo',
  templateUrl: './multiple-items-demo.component.html',
  styleUrls: ['./multiple-items-demo.component.scss']
})
export class MultipleItemsDemoComponent implements OnInit {
  multipleItems = [];

  // change this if you want different amount of items
  nItems = 1000;

  tableData: LocalDataSource<ExampleData>;

  // noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
  tableSettings = {

    rowClassFunction: () => {
      return 'row-class';
    },
    noDataMessage: '',

    selectMode: 'multi', // for multi-selection

    actions: false,
    attr: {class: 'items-table'},
    // some pagination options:
    // pager: {display: false},
    //    pager: {display: true},//pagination
    // pager: {display: true, perPage: 10 },//pagination
    pager: {display: true, showPagesCount: 6, styleClasses: 'pager-style'}, // pagination with some properties


    columns: {
      name: {
        title: 'NAME',
      },
      myNumber: {
        title: 'Number',
      },
      myBoolean: {
        title: 'True/False'
      },
      myCustom: {
        title: 'custom-component',
        type: 'custom',
        valuePrepareFunction: (cellValue, rowData, cellData) => {

          return cellValue;

        },
        renderComponent: St2CellDataComponent,

      }
    }
  };

  constructor() {
  }

  ngOnInit(): void {
    console.log('hi multiple-items-demo');
    for (let i = 1; i <= this.nItems; i++) {
      const tempObj = {
        name: this.generateRandomString(6),
        myNumber: this.generateRandomNumber(1000),
        myBoolean: this.generateRandomNumber(1000) % 2 === 0,
        myCustom: this.generateRandomNumber(1000)
      };
      this.multipleItems.push(tempObj);
    }
    console.log('object = ', this.multipleItems);
    this.tableData = new LocalDataSource(this.multipleItems);


  }

  generateRandomString(length): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateRandomNumber(max): number {
    return Math.floor(Math.random() * Math.floor(max));

  }

}
