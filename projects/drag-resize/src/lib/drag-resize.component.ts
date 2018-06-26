import {
  Component,
  HostListener,
  OnInit,
  Input,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'dnr-drag-resize',
  templateUrl: './drag-resize.component.html',
  styleUrls: ['./drag-resize.component.scss'],
})
export class DragResizeComponent implements OnInit {
  @Input() src: string;

  x: number;
  y: number;
  px: number;
  py: number;
  width: number;
  height: number;

  mouseStartAngle: number;
  elementStartAngle: number;
  elementCurrentAngle: number;

  ix: number;
  iy: number;
  iWidth: number;
  iHeight: number;

  selected: boolean;

  minArea: number;

  draggingCorner: boolean;
  draggingWindow: boolean;
  draggingImg: boolean;
  resizer: Function;

  resizePercentage = 0.2;

  get differentSize() {
    return this.width !== this.iWidth || this.height !== this.iHeight;
  }

  get rotationTransform() {
    const degrees = this.radiansToDegree(this.elementCurrentAngle);
    return `rotate(${degrees}deg)`;
  }

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.px = 0;
    this.py = 0;

    this.x = 300;
    this.y = 300;
    this.width = 375;
    this.height = 150;

    this.mouseStartAngle = 0;
    this.elementStartAngle = 0;
    this.elementCurrentAngle = 0;

    this.ix = 0;
    this.iy = 0;
    this.iWidth = 375;
    this.iHeight = 150;

    this.selected = false;
    this.draggingCorner = false;
    this.draggingWindow = false;
    this.draggingImg = false;
    this.minArea = 20000;
  }

  area() {
    return this.width * this.height;
  }

  onWindowPress(event: MouseEvent) {
    this.selected = true;

    if (this.draggingImg) {
      return;
    }
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

  onImgPress(event: MouseEvent) {
    this.draggingWindow = false;
    this.draggingImg = true;

    this.px = event.clientX;
    this.py = event.clientY;
  }

  onImgDrag(event: MouseEvent) {
    if (!this.draggingImg) {
      return;
    }

    const offsetX = event.clientX - this.px;
    const offsetY = event.clientY - this.py;

    this.ix += offsetX;
    this.iy += offsetY;

    this.px = event.clientX;
    this.py = event.clientY;

    this.applyConstraints();
  }

  topLeftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.y += offsetY;
    this.width -= offsetX;
    this.height -= offsetY;
  }

  topResize(offsetX: number, offsetY: number) {
    this.y += offsetY;
    this.height -= offsetY;
  }

  rightResize(offsetX: number, offsetY: number) {
    this.width += offsetX;
  }

  bottomResize(offsetX: number, offsetY: number) {
    this.height += offsetY;
  }

  leftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.width -= offsetX;
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

    const center = this.getElementCenter();
    const startXFromCenter = event.pageX - center.x;
    const startYFromCenter = event.pageY - center.y;
    this.mouseStartAngle = Math.atan2(startYFromCenter, startXFromCenter);
    this.elementStartAngle = this.elementCurrentAngle;

    this.resizer = resizer;
    event.preventDefault();
    event.stopPropagation();
  }

  rotate(offsetX: number, offsetY: number, event: MouseEvent) {
    this.elementCurrentAngle = this.calculateRotateAngle(event);
  }

  zoomIn() {
    this.iWidth += this.iWidth * this.resizePercentage;
    this.iHeight += this.iHeight * this.resizePercentage;
    this.applyConstraints();
  }

  zoomOut() {
    this.iWidth -= this.iWidth * this.resizePercentage;
    this.iHeight -= this.iHeight * this.resizePercentage;
    this.applyConstraints();
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

    this.resizer(offsetX, offsetY, event);

    if (this.area() < this.minArea) {
      this.x = lastX;
      this.y = lastY;
      this.width = pWidth;
      this.height = pHeight;
    }
    this.px = event.clientX;
    this.py = event.clientY;

    this.applyConstraints();
  }

  applyConstraints() {
    if (this.ix + this.iWidth < this.width) {
      this.ix = this.width - this.iWidth;
    }

    if (this.ix > 0) {
      this.ix = 0;
    }

    if (this.iy + this.iHeight < this.height) {
      this.iy = this.height - this.iHeight;
    }

    if (this.iy > 0) {
      this.iy = 0;
    }

    if (this.iHeight < this.height) {
      this.iHeight = this.height;
    }

    if (this.iWidth < this.width) {
      this.iWidth = this.width;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onCornerRelease(event: MouseEvent) {
    this.draggingWindow = false;
    this.draggingCorner = false;
    this.draggingImg = false;

    if (
      this.elementRef &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.selected = false;
    }
  }

  private calculateRotateAngle(event: MouseEvent) {
    const center = this.getElementCenter();

    const xFromCenter = event.pageX - center.x;
    const yFromCenter = event.pageY - center.y;
    const mouseAngle = Math.atan2(yFromCenter, xFromCenter);
    const rotateAngle =
      mouseAngle - this.mouseStartAngle + this.elementStartAngle;

    return rotateAngle;
  }

  private getElementCenter(): { x: number; y: number } {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    return { x: centerX, y: centerY };
  }

  private radiansToDegree(radians: number) {
    return (radians * 180) / Math.PI;
  }
}
