import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DragResizeComponent } from './drag-resize.component';

describe('DragResizeComponent', () => {
  let component: DragResizeComponent;
  let fixture: ComponentFixture<DragResizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragResizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragResizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
