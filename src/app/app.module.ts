import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DragResizeModule } from 'projects/drag-resize/src/public_api';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DragResizeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
