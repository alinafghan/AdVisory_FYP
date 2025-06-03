import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  BehaviorSubject,
  fromEvent,
  Subject,
  Subscription,
  takeUntil,
  tap,map
} from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mrr',
  template: `
    <div class="box-wrapper" id="box-wrapper-{{ id }}" #boxWrapper>
      <div class="box" id="box" #box>
        <ng-content></ng-content>

        <div [ngStyle]="{ display: (active$ | async) ? '' : 'none' }">
          <div class="dot rotate" id="rotate" #rotate></div>
          <div class="dot left-top" id="left-top"></div>
          <div class="dot left-bottom" id="left-bottom"></div>
          <div class="dot right-bottom" id="right-bottom"></div>
          <div class="dot right-top" id="right-top"></div>
          <div class="rotate-link"></div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./mrr.component.scss'], // Ensure this matches your actual SCSS file name
  styles: [`
    .box-wrapper {
      position: absolute;
      cursor: move;
    }
    .box {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .dot {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: blue;
      border-radius: 50%;
    }
    .rotate {
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
    }
    .left-top {
      top: 0;
      left: 0;
      cursor: nwse-resize;
    }
    .right-top {
      top: 0;
      right: 0;
      cursor: nesw-resize;
    }
    .left-bottom {
      bottom: 0;
      left: 0;
      cursor: nesw-resize;
    }
    .right-bottom {
      bottom: 0;
      right: 0;
      cursor: nwse-resize;
    }
  `], // Inline styles as a fallback
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class MrrComponent implements OnInit, OnDestroy {
  @ViewChild('boxWrapper', { static: true })
  boxWrapperElRef!: ElementRef<HTMLDivElement>;

  @ViewChild('box', { static: true }) 
  boxElRef!: ElementRef<HTMLDivElement>;

  @ViewChild('rotate', { static: true })
  rotateElRef!: ElementRef<HTMLDivElement>;

  @Input() id!: string | number;
  @Input() minWidth: number = 50;
  @Input() minHeight: number = 50;
  @Input() initialTop: number = 50;
  @Input() initialLeft: number = 50;

  @Input() set disabled(disabled: boolean) {
    this.active$.next(!disabled);
  }

  private resizingSubs: Subscription[] = [];
  private draggingSub?: Subscription;

  active$ = new BehaviorSubject<boolean>(true);

  initX: number = 0;
  initY: number = 0;
  mousePressX: number = 0;
  mousePressY: number = 0;
  initW: number = 0;
  initH: number = 0;
  initRotate: number = 0;

  get boxWrapper(): HTMLDivElement {
    return this.boxWrapperElRef.nativeElement;
  }

  get box(): HTMLDivElement {
    return this.boxElRef.nativeElement;
  }

  get rotateBtn(): HTMLDivElement {
    return this.rotateElRef.nativeElement;
  }

  private destroy$ = new Subject<void>();

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.active$.pipe(takeUntil(this.destroy$)).subscribe((active) => {
      if (active) {
        this.enableResizing();
        this.enableDragging();
      } else {
        this.disableResizing();
        this.disableDrag();
      }
    });

    this.handleRotating();

    this.resize(this.minWidth, this.minHeight);
    this.repositionElement(this.initialTop, this.initialLeft);
  }

  // Add getTransformState method to retrieve current transformation properties
  getTransformState() {
    // Get the center position of the element
    const rect = this.boxWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get current rotation in degrees
    const rotation = this.getCurrentRotation(this.boxWrapper);
    
    // Calculate scale by comparing current dimensions with initial ones
    // If initial dimensions aren't stored, we'll use 1 as default scale
    const baseWidth = this.minWidth;
    const baseHeight = this.minHeight;
    const currentWidth = this.box.offsetWidth;
    const currentHeight = this.box.offsetHeight;
    
    // Calculate scale as the average of width and height scale factors
    const widthScale = currentWidth / baseWidth;
    const heightScale = currentHeight / baseHeight;
    const scale = (widthScale + heightScale) / 2;
    
    return {
      x: centerX,
      y: centerY,
      rotation: rotation,
      scale: scale,
      // Also provide individual dimensional data which might be useful
      width: currentWidth,
      height: currentHeight,
      top: this.boxWrapper.offsetTop,
      left: this.boxWrapper.offsetLeft
    };
  }

  private repositionElement(x: number, y: number): void {
    this.boxWrapper.style.left = x + 'px';
    this.boxWrapper.style.top = y + 'px';
  }

  public resize(width: number, height: number): void {
    this.box.style.width = width + 'px';
    this.box.style.height = height + 'px';
  }

  private rotateBox(deg: number): void {
    this.boxWrapper.style.transform = `rotate(${deg}deg)`;
  }

  public getCurrentRotation(el: HTMLElement): number {
    const st = window.getComputedStyle(el, null);
    const tm = 
      st.getPropertyValue('-webkit-transform') ||
      st.getPropertyValue('-moz-transform') ||
      st.getPropertyValue('-ms-transform') ||
      st.getPropertyValue('-o-transform') ||
      st.getPropertyValue('transform');

    if (tm !== 'none') {
      const values = tm.split('(')[1].split(')')[0].split(',');
      const angle = Math.round(
        Math.atan2(parseFloat(values[1]), parseFloat(values[0])) * (180 / Math.PI)
      );
      return angle < 0 ? angle + 360 : angle;
    }
    return 0;
  }

  enableResizing(): void {
    const leftTopMouseDown$ = fromEvent<MouseEvent>(
      this.getElById('left-top')!,
      'mousedown'
    ).pipe(
      map((e: MouseEvent) => {
        this.resizeHandler(e, true, true, true, true);
        return e;
      })
    );

    const rightTopMouseDown$ = fromEvent<MouseEvent>(
      this.getElById('right-top')!,
      'mousedown'
    ).pipe(
      map((e: MouseEvent) => {
        this.resizeHandler(e, false, true, true, true);
        return e;
      })
    );

    const rightBottomMouseDown$ = fromEvent<MouseEvent>(
      this.getElById('right-bottom')!,
      'mousedown'
    ).pipe(
      map((e: MouseEvent) => {
        this.resizeHandler(e, false, false, true, true);
        return e;
      })
    );

    const leftBottomMouseDown$ = fromEvent<MouseEvent>(
      this.getElById('left-bottom')!,
      'mousedown'
    ).pipe(
      map((e: MouseEvent) => {
        this.resizeHandler(e, true, false, true, true);
        return e;
      })
    );

    this.ngZone.runOutsideAngular(() => {
      this.resizingSubs.push(
        leftTopMouseDown$.subscribe(),
        rightTopMouseDown$.subscribe(),
        rightBottomMouseDown$.subscribe(),
        leftBottomMouseDown$.subscribe()
      );
    });
  }

  disableResizing(): void {
    this.resizingSubs.forEach((sub) => sub.unsubscribe());
    this.resizingSubs = [];
  }

  enableDragging(): void {
    const boxWrapperMouseDown$ = fromEvent<MouseEvent>(
      this.boxWrapper,
      'mousedown',
      { capture: true }
    ).pipe(
      tap((event: any) => {
        if (
          event.target.className.indexOf('dot') > -1 ||
          event.target.className !== 'box'
        ) {
          event.preventDefault();
          return;
        }

        this.initX = this.boxWrapper.offsetLeft;
        this.initY = this.boxWrapper.offsetTop;
        this.mousePressX = event.clientX;
        this.mousePressY = event.clientY;

        const eventMoveHandler = (event: MouseEvent) => {
          this.repositionElement(
            this.initX + (event.clientX - this.mousePressX),
            this.initY + (event.clientY - this.mousePressY)
          );
        };

        const eventEndHandler = () => {
          this.boxWrapper.removeEventListener(
            'mousemove',
            eventMoveHandler as EventListener,
            false
          );
          window.removeEventListener('mouseup', eventEndHandler);
        };

        this.boxWrapper.addEventListener('mousemove', eventMoveHandler as EventListener, false);
        window.addEventListener('mouseup', eventEndHandler, false);
      })
    );

    this.ngZone.runOutsideAngular(() => {
      this.draggingSub = boxWrapperMouseDown$.subscribe();
    });
  }

  disableDrag(): void {
    this.draggingSub?.unsubscribe();
  }

  handleRotating(): void {
    this.ngZone.runOutsideAngular(() => {
      this.rotateBtn.addEventListener(
        'mousedown',
        (event: MouseEvent) => {
          this.initX = this.boxWrapper.offsetLeft;
          this.initY = this.boxWrapper.offsetTop;
          this.mousePressX = event.clientX;
          this.mousePressY = event.clientY;

          const arrow = document.querySelector('#box');
          const arrowRects = arrow!.getBoundingClientRect();
          const arrowX = arrowRects.left + arrowRects.width / 2;
          const arrowY = arrowRects.top + arrowRects.height / 2;

          const eventMoveHandler = (event: MouseEvent) => {
            const angle =
              Math.atan2(event.clientY - arrowY, event.clientX - arrowX) -
              Math.PI / 2;
            this.rotateBox((angle * 180) / Math.PI);
          };

          const eventEndHandler = () => {
            window.removeEventListener('mousemove', eventMoveHandler, false);
            window.removeEventListener('mouseup', eventEndHandler);
          };

          window.addEventListener('mousemove', eventMoveHandler, false);
          window.addEventListener('mouseup', eventEndHandler, false);
        },
        false
      );
    });
  }

  private resizeHandler(
    event: MouseEvent,
    left = false,
    top = false,
    xResize = false,
    yResize = false
  ) {
    this.initX = this.boxWrapper.offsetLeft;
    this.initY = this.boxWrapper.offsetTop;
    this.mousePressX = event.clientX;
    this.mousePressY = event.clientY;

    this.initW = this.box.offsetWidth;
    this.initH = this.box.offsetHeight;

    this.initRotate = this.getCurrentRotation(this.boxWrapper);
    const initRadians = (this.initRotate * Math.PI) / 180;
    const cosFraction = Math.cos(initRadians);
    const sinFraction = Math.sin(initRadians);

    const eventMoveHandler = (event: MouseEvent) => {
      let wDiff = event.clientX - this.mousePressX;
      let hDiff = event.clientY - this.mousePressY;
      let rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
      let rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

      let newW = this.initW,
          newH = this.initH,
          newX = this.initX,
          newY = this.initY;

      if (xResize) {
        if (left) {
          newW = this.initW - rotatedWDiff;
        } else {
          newW = this.initW + rotatedWDiff;
        }
        if (newW < this.minWidth) {
          newW = this.minWidth;
        }
      }

      if (yResize) {
        if (top) {
          newH = this.initH - rotatedHDiff;
        } else {
          newH = this.initH + rotatedHDiff;
        }
        if (newH < this.minHeight) {
          newH = this.minHeight;
        }
      }

      let scale;
      if (xResize && yResize) {
        scale = Math.max(newW / this.initW, newH / this.initH);
        newW = scale * this.initW;
        newH = scale * this.initH;
      }

      if (xResize) {
        if (left) {
          rotatedWDiff = this.initW - newW;
        } else {
          rotatedWDiff = newW - this.initW;
        }
        newX += 0.5 * rotatedWDiff * cosFraction;
        newY += 0.5 * rotatedWDiff * sinFraction;
      }

      if (yResize) {
        if (top) {
          rotatedHDiff = this.initH - newH;
        } else {
          rotatedHDiff = newH - this.initH;
        }
        newX -= 0.5 * rotatedHDiff * sinFraction;
        newY += 0.5 * rotatedHDiff * cosFraction;
      }

      this.resize(newW, newH);
      this.repositionElement(newX, newY);
    };

    const eventEndHandler = () => {
      window.removeEventListener('mousemove', eventMoveHandler, false);
      window.removeEventListener('mouseup', eventEndHandler);
    };

    window.addEventListener('mousemove', eventMoveHandler, false);
    window.addEventListener('mouseup', eventEndHandler, false);
  }

  private rotate(x: number, y: number, cx: number, cy: number, angle: number): number[] {
    return [
      (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
      (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
    ];
  }

  private getElById(elId: string): HTMLElement | null {
    return this.boxWrapper.querySelector(`#${elId}`);
  }
  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disableResizing();
    this.disableDrag();
  }
}