import {
  Component,
  HostListener,
  OnInit,
  Input,
  ElementRef,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'dnr-drag-resize',
  templateUrl: './drag-resize.component.html',
  styleUrls: ['./drag-resize.component.scss'],
})
export class DragResizeComponent implements OnInit {
  @Input() src: string;

  px: number;
  py: number;

  @HostBinding('style.left.px') x: number;
  @HostBinding('style.top.px') y: number;
  @HostBinding('style.width.px') width: number;
  @HostBinding('style.height.px') height: number;

  ix: number;
  iy: number;
  iWidth: number;
  iHeight: number;

  rotating: boolean;
  mouseStartAngle: number;
  elementStartAngle: number;
  elementCurrentAngle: number;

  selected: boolean;

  minArea: number;

  draggingHandle: boolean;
  draggingWindow: boolean;
  draggingImg: boolean;
  resizer: Function;

  resizePercentage = 0.2;

  get differentSize() {
    return this.width !== this.iWidth || this.height !== this.iHeight;
  }

  @HostBinding('style.transform')
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

    this.rotating = false;
    this.mouseStartAngle = 0;
    this.elementStartAngle = 45;
    this.elementCurrentAngle = 0;

    this.ix = 0;
    this.iy = 0;
    this.iWidth = 375;
    this.iHeight = 150;

    this.selected = false;
    this.draggingHandle = false;
    this.draggingWindow = false;
    this.draggingImg = false;
    this.minArea = 20000;
  }

  area() {
    return this.width * this.height;
  }

  @HostListener('mousedown', ['$event'])
  onWindowPress(event: MouseEvent) {
    this.selected = true;

    if (this.draggingImg) {
      return;
    }
    this.draggingWindow = true;
    this.px = event.clientX;
    this.py = event.clientY;
  }

  @HostListener('mousemove', ['$event'])
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

  onResizeHandleClick(event: MouseEvent, resizer?: Function) {
    this.draggingHandle = true;

    this.px = event.clientX;
    this.py = event.clientY;

    this.resizer = resizer;
    event.preventDefault();
    event.stopPropagation();
  }

  onRotateHandleClick(event: MouseEvent) {
    this.rotating = true;
    this.mouseStartAngle = this.getAngle(event);
    this.elementStartAngle = this.elementCurrentAngle;

    event.preventDefault();
    event.stopPropagation();
  }

  rotate(event: MouseEvent) {
    const mouseAngle = this.getAngle(event);
    this.elementCurrentAngle =
      mouseAngle - this.mouseStartAngle + this.elementStartAngle;
  }

  getAngle(event: MouseEvent): number {
    const center = this.getElementCenter();

    const xFromCenter = event.pageX - center.x;
    const yFromCenter = event.pageY - center.y;
    const mouseAngle = Math.atan2(yFromCenter, xFromCenter);

    return mouseAngle;
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
  onHandleMove(event: MouseEvent) {
    if (this.rotating) {
      this.rotate(event);
    }

    if (this.draggingHandle) {
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
  onHandleRelease(event: MouseEvent) {
    if (
      !this.draggingHandle &&
      !this.rotating &&
      this.elementRef &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.selected = false;
    }
    this.draggingWindow = false;
    this.draggingHandle = false;
    this.draggingImg = false;
    this.rotating = false;
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
