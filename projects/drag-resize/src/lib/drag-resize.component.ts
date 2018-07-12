import {
  Component,
  HostListener,
  OnInit,
  Input,
  ElementRef,
  HostBinding,
} from '@angular/core';

export enum State {
  DEFAULT,
  DRAGGING,
  RESIZING,
  REPOSITIONING,
  ROTATING,
}

@Component({
  selector: 'dnr-drag-resize',
  templateUrl: './drag-resize.component.html',
  styleUrls: ['./drag-resize.component.scss'],
})
export class DragResizeComponent implements OnInit {
  @Input() src: string;

  px: number;
  py: number;

  @HostBinding('style.left.px')
  @Input()
  x: number;

  @HostBinding('style.top.px')
  @Input()
  y: number;

  @HostBinding('style.width.px')
  @Input()
  width: number;

  @HostBinding('style.height.px')
  @Input()
  height: number;

  ix: number;
  iy: number;
  iWidth: number;
  iHeight: number;

  mouseStartAngle: number;
  elementStartAngle: number;
  elementCurrentAngle: number;

  selected: boolean;

  minArea: number;

  resizer: Function;

  resizePercentage = 0.2;

  state: State;

  get draggingImg() {
    return this.state === State.REPOSITIONING;
  }

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
    this.state = State.DEFAULT;

    this.px = 0;
    this.py = 0;

    this.mouseStartAngle = 0;
    this.elementStartAngle = 45;
    this.elementCurrentAngle = 0;

    this.ix = 0;
    this.iy = 0;
    this.iWidth = this.width;
    this.iHeight = this.height;

    this.selected = false;
    this.minArea = 20000;
  }

  area() {
    return this.width * this.height;
  }

  @HostListener('mousedown', ['$event'])
  onWindowPress(event: MouseEvent) {
    this.selected = true;

    if (this.state === State.REPOSITIONING) {
      return;
    }
    this.state = State.DRAGGING;
    this.px = event.clientX;
    this.py = event.clientY;
  }

  @HostListener('document:mousedown')
  onMouseDown() {
    if (
      this.state !== State.RESIZING &&
      this.state !== State.ROTATING &&
      this.elementRef &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.selected = false;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onHandleMove(event: MouseEvent) {
    switch (this.state) {
      case State.ROTATING:
        this.rotate(event);
        break;
      case State.RESIZING:
        this.resize(event);
        break;
      case State.DRAGGING:
        this.drag(event);
        break;
      case State.REPOSITIONING:
        this.imgDrag(event);
        break;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onHandleRelease(event: MouseEvent) {
    this.state = State.DEFAULT;
  }

  private drag(event: MouseEvent) {
    if (this.state !== State.DRAGGING) {
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
    this.state = State.REPOSITIONING;

    this.px = event.clientX;
    this.py = event.clientY;
  }

  private imgDrag(event: MouseEvent) {
    if (this.state !== State.REPOSITIONING) {
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
    this.state = State.RESIZING;

    this.px = event.clientX;
    this.py = event.clientY;

    this.resizer = resizer;
    event.preventDefault();
    event.stopPropagation();
  }

  onRotateHandleClick(event: MouseEvent) {
    this.state = State.ROTATING;

    this.mouseStartAngle = this.getAngle(event);
    this.elementStartAngle = this.elementCurrentAngle;

    event.preventDefault();
    event.stopPropagation();
  }

  private rotate(event: MouseEvent) {
    const mouseAngle = this.getAngle(event);
    this.elementCurrentAngle =
      mouseAngle - this.mouseStartAngle + this.elementStartAngle;
  }

  private getAngle(event: MouseEvent): number {
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

  private resize(event: MouseEvent) {
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

  private applyConstraints() {
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

  private getElementCenter(): { x: number; y: number } {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    return { x: centerX, y: centerY };
  }

  private radiansToDegree(radians: number) {
    return (radians * 180) / Math.PI;
  }
}
