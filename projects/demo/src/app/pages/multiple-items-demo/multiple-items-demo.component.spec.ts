import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleItemsDemoComponent } from './multiple-items-demo.component';

describe('MultipleItemsDemoComponent', () => {
  let component: MultipleItemsDemoComponent;
  let fixture: ComponentFixture<MultipleItemsDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleItemsDemoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleItemsDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
