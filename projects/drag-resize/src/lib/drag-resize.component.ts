import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'dnr-drag-resize',
  template: `
    <div class="container"
      [class.active]="draggingWindow"
      [style.top.px]='y'
      [style.left.px]='x'
      [style.width.px]='width'
      [style.height.px]='height'
      (mousedown)='onWindowPress($event)'
      (mousemove)='onWindowDrag($event)'>
      <div class="handle handle-tl" (mousedown)='onCornerClick($event, topLeftResize)'></div>
      <div class="handle handle-tr" (mousedown)='onCornerClick($event, topRightResize)'></div>
      <div class="handle handle-br" (mousedown)='onCornerClick($event, bottomRightResize)'></div>
      <div class="handle handle-bl" (mousedown)='onCornerClick($event, bottomLeftResize)'></div>

      <div class="content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    '.container { position: fixed; background-color: black; opacity: 0.8;}',
    '.handle { position: absolute; width: 10px; height: 10px; border: 2px solid #666666; border-radius: 50%; background-color: #fff;}',
    '.handle-tl { top: -6px; left: -6px; }',
    '.handle-tr { top: -6px; right: -6px; }',
    '.handle-bl { bottom: -6px; left: -6px; }',
    '.handle-br { bottom: -6px; right: -6px; }',
  ],
})
export class DragResizeComponent implements OnInit {
  x: number;
  y: number;
  px: number;
  py: number;
  width: number;
  height: number;
  minArea: number;
  selected: boolean;
  draggingCorner: boolean;
  draggingWindow: boolean;
  resizer: Function;

  constructor() {
    this.x = 300;
    this.y = 300;
    this.px = 0;
    this.py = 0;
    this.width = 600;
    this.height = 300;
    this.draggingCorner = false;
    this.draggingWindow = false;
    this.minArea = 20000;
  }

  ngOnInit() {}

  area() {
    return this.width * this.height;
  }

  onWindowPress(event: MouseEvent) {
    this.selected = true;
    this.draggingWindow = true;
    this.px = event.clientX;
    this.py = event.clientY;
  }

  onWindowDrag(event: MouseEvent) {
    if (!this.draggingWindow) {
      return;
    }
    const offsetX = event.clientX - this.px;
    const offsetY = event.clientY - this.py;

    this.x += offsetX;
    this.y += offsetY;
    this.px = event.clientX;
    this.py = event.clientY;
  }

  topLeftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.y += offsetY;
    this.width -= offsetX;
    this.height -= offsetY;
  }

  topRightResize(offsetX: number, offsetY: number) {
    this.y += offsetY;
    this.width += offsetX;
    this.height -= offsetY;
  }

  bottomLeftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.width -= offsetX;
    this.height += offsetY;
  }

  bottomRightResize(offsetX: number, offsetY: number) {
    this.width += offsetX;
    this.height += offsetY;
  }

  onCornerClick(event: MouseEvent, resizer?: Function) {
    this.draggingCorner = true;
    this.px = event.clientX;
    this.py = event.clientY;
    this.resizer = resizer;
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onCornerMove(event: MouseEvent) {
    if (!this.draggingCorner) {
      return;
    }
    const offsetX = event.clientX - this.px;
    const offsetY = event.clientY - this.py;

    const lastX = this.x;
    const lastY = this.y;
    const pWidth = this.width;
    const pHeight = this.height;

    this.resizer(offsetX, offsetY);
    if (this.area() < this.minArea) {
      this.x = lastX;
      this.y = lastY;
      this.width = pWidth;
      this.height = pHeight;
    }
    this.px = event.clientX;
    this.py = event.clientY;
  }

  @HostListener('document:mouseup', ['$event'])
  onCornerRelease(event: MouseEvent) {
    this.draggingWindow = false;
    this.draggingCorner = false;
  }
}
