import {Component} from '@angular/core';

/**
 * Element for data columns of the SmartTable-NG2, with data-auto attribute
 */
@Component({
  selector: 'data-col-el',
  template: `
    <span [attr.data-auto]="value" [ngClass]="'st2-col-' + value"><b>{{value}}</b></span>
  `,

})
export class St2CellDataComponent {
  value: any;
}
