import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';

import {ConfirmResponse, Grid} from '../../lib/grid';
import { DataSource } from '../../lib/data-source/data-source';

@Component({
    selector: '[ng2-st-thead]',
    templateUrl: './thead.component.html',
})
export class Ng2SmartTableTheadComponent<T extends object> implements OnChanges {

    @Input() grid: Grid<T>;
    @Input() source: DataSource<T>;
    @Input() isAllSelected: boolean;
    @Input() createConfirm: EventEmitter<ConfirmResponse<T>>;

    @Output() sort = new EventEmitter<void>();
    @Output() selectAllRows = new EventEmitter<Event>();
    @Output() create = new EventEmitter<{source: DataSource<T>}>();
    @Output() filter = new EventEmitter<any>();

    isHideHeader: boolean;
    isHideSubHeader: boolean;

  ngOnChanges() {
      this.isHideHeader = this.grid.getSetting('hideHeader');
      this.isHideSubHeader = this.grid.getSetting('hideSubHeader');
    }
}
