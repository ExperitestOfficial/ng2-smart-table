import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {FilterDefault} from './filter-default';
import {Column} from '../../lib/data-set/column';
import {DataSource} from '../../lib/data-source/data-source';
import {Observable} from 'rxjs';

/**
 * custom component
 */
export interface Ng2CustomComponent<T extends object, D extends keyof T> extends OnChanges {
  query?: string;
  save?: Observable<T>;
  column?: Column<T, unknown, D>;
  source?: DataSource<T>;
  inputClass?: string;
  filter?: Observable<string>;
  ngOnChanges: (changes: SimpleChanges) => void;
}

@Component({
  selector: 'custom-table-filter',
  template: `
    <ng-template #dynamicTarget></ng-template>`,
})
export class CustomFilterComponent<T extends object,
  C extends Ng2CustomComponent<T, keyof T>>
  extends FilterDefault<T>
  implements OnChanges, OnDestroy {

  @Input() query: string;
  customComponent: ComponentRef<C>;
  @ViewChild('dynamicTarget', {read: ViewContainerRef, static: true}) dynamicTarget: any;

  constructor(private resolver: ComponentFactoryResolver) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.column && !this.customComponent) {
      if (!this.column.filter) {
        throw new Error('filter component is required but is missing');
      }
      const componentFactory = this.resolver.resolveComponentFactory(this.column.filter.component);
      this.customComponent = this.dynamicTarget.createComponent(componentFactory);

      // set @Inputs and @Outputs of custom component
      this.customComponent.instance.query = this.query;
      this.customComponent.instance.column = this.column;
      this.customComponent.instance.source = this.source;
      this.customComponent.instance.inputClass = this.inputClass;
      this.customComponent.instance.filter.subscribe((event: string) => this.onFilter(event));
    }
    if (this.customComponent) {
      this.customComponent.instance.ngOnChanges(changes);
    }
  }

  ngOnDestroy(): void {
    if (this.customComponent) {
      this.customComponent.destroy();
    }
  }
}
