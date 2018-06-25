import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DragResizeComponent } from './drag-resize.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [DragResizeComponent],
  exports: [DragResizeComponent],
})
export class DragResizeModule {}
