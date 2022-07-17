import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, NgZone, OnDestroy } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { fromEvent } from 'rxjs';

export interface IDOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPageCoord {
  x: number;
  y: number;
}

@Directive({
  selector: '[nuiDrag]'
})
export class NuiDragDirective implements OnDestroy {

  private dragElInitialPosition!: IPageCoord;
  private dragElCurrentPosition!: IPageCoord;
  private dragStartPosition!: IPageCoord;
  private dragCurrentPosition!: IPageCoord;
  private dragDelta!: IPageCoord;
  private dragOrgDelta!: IPageCoord;
  
  private get dragEl(): HTMLElement {
    return this.el.nativeElement;
  }

  private isDragInitiated = false;

  private destroy$ = new Subject();
  private document: Document;

  constructor(
    private el: ElementRef,
    private _ngZone: NgZone,
    @Inject(DOCUMENT) document: Document
  ) {
    this.document = document;
    this.init();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


  // private methods

  private init() {
    this.dragElInitialPosition = this.getElCoordinate(this.dragEl);
    this.attachListeners();
  }

  private attachListeners() {
    fromEvent<MouseEvent>(this.el.nativeElement, 'mousedown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.onPointerDown(evt);
        this.initializeDragging();
      });
  }

  private initializeDragging() {
    const upEvent = fromEvent<MouseEvent>(this.document, 'mouseup')
      .pipe(
        takeUntil(this.destroy$),
        tap(evt => {
          this.onPointerUp(evt);
        })
      );

    fromEvent<MouseEvent>(this.document, 'mousemove')
      .pipe(takeUntil(upEvent))
      .subscribe(evt => {
        this.onPointerMove(evt);
      });

  }

  private onPointerDown(evt: MouseEvent) {
    this.isDragInitiated = true;
    this.dragElCurrentPosition = this.getElCoordinate(this.dragEl);
    this.dragStartPosition = { x: evt.pageX, y: evt.pageY };
  }

  private onPointerMove(evt: MouseEvent) {
    if (this.isDragInitiated) {
      this.moveElement(evt);
    }
  }

  private onPointerUp(evt: MouseEvent) {
    this.isDragInitiated = false;
    this.removeMoveStyle();
  }

  private moveElement(evt: MouseEvent) {
    if (this.isDragInitiated) {

      const currentDelta = {
        x: this.dragStartPosition.x - this.dragElCurrentPosition.x,
        y: this.dragStartPosition.y - this.dragElCurrentPosition.y
      };

      const currentOrgDelta = {
        x: this.dragElInitialPosition.x - currentDelta.x,
        y: this.dragElInitialPosition.y - currentDelta.y 
      };

      const distanceMoved = {
        x: evt.pageX - currentOrgDelta.x,
        y: evt.pageY - currentOrgDelta.y
      };

      this.dragEl.style.transform = `translate3d(${distanceMoved.x}px, ${distanceMoved.y}px, 0px)`;
      this.setStyleOnMove();
    }
  }

  private getElCoordinate(el: HTMLElement) {
    const { left, top, width, height } = el.getBoundingClientRect();
    return { x: left, y: top, width, height };
  }

  private setStyleOnMove() {
    this.dragEl.style.setProperty('user-select', 'none');
  }

  private removeMoveStyle() {
    this.dragEl.style.removeProperty('userSelect');
  }
}
