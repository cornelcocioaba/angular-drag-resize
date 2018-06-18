import { TestBed, inject } from '@angular/core/testing';

import { DragResizeService } from './drag-resize.service';

describe('DragResizeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DragResizeService]
    });
  });

  it('should be created', inject([DragResizeService], (service: DragResizeService) => {
    expect(service).toBeTruthy();
  }));
});
